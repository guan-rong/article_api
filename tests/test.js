const request = require("supertest");
const server = require("../backend/app");
const { describe, it } = require("@jest/globals");

let tokenArray = [];

afterAll((done) => {
    server.close(done);
});
describe("Obtain token to start testing", () => {
    it("should provide token if login is successful", async () => {
        const response = await request(server)
            .post("/api/authenticate")
            .send({
                login: "default",
                password: "default",
            })
            .expect(200);
        expect(response.body).toHaveProperty("token");
        expect(typeof response.body.token).toBe("string");
        tokenArray["default"] = response.body.token;
    });
});
describe("POST /api/user", () => {
    // add a user to database
    // token should be added, so its probably similar to admins adding new account?

    describe("API endpoint for creating a user", () => {
        it("should respond with HTTP 400 if the request body is empty", () => {
            request(server).post("/api/user").expect(400);
        });

        it("should respond with HTTP 400 if token is not provided while creating", async () => {
            await request(server)
                .post("/api/user")
                .send({
                    user_id: 50,
                    login: "token_test",
                    password: "password_true",
                })
                .expect(400);
        });

        it("should respond with HTTP 201 and create a new user", async () => {
            const response = await request(server)
                .post("/api/user")
                .set("Authorization", `Bearer ${tokenArray["default"]}`)
                .send({
                    user_id: 42,
                    login: "login_true",
                    password: "password_true",
                })
                .expect(201);
            console.log("response >>>", response.statusCode, response.body);
        });

        it("should respond with HTTP 409 if the user already exists", async () => {
            await request(server)
                .post("/api/user")
                .set("Authorization", `Bearer ${tokenArray["default"]}`)
                .send({
                    user_id: 42,
                    login: "login_true",
                    password: "password_true",
                })
                .expect(409);
        });
    });
});

describe("POST /api/authenticate", () => {
    // login API
    describe("API endpoint for login", () => {
        it("should respond with HTTP 400 if the request body is empty", async () => {
            await request(server)
                .post("/api/authenticate")
                .expect(400);
        });

        it("should respond with HTTP 404 if there is no user of the given login name in the database", async () => {
            const response = await request(server)
                .post("/api/authenticate")
                .send({
                    login: "login_undefined",
                    password: "password_true",
                })
                .expect(404);
            console.log("response body 404", response.body);
        });

        it("should respond with HTTP 401 if a user with the given login name exists, but the password does not match that saved in the database for the corresponding User", async () => {
            const response = await request(server)
                .post("/api/authenticate")
                .send({
                    login: "login_true",
                    password: "password_false",
                })
                .expect(401);
            console.log("response body 401", response.body);
        });

        it("should respond with HTTP 200 if a user with the given login name exists and the given password matches that saved in the database.", async () => {
            const response = await request(server)
                .post("/api/authenticate")
                .send({
                    login: "login_true",
                    password: "password_true",
                })
                .expect(200);
            // this also works. seems like jest will automatically assume that we are accessing the body??
            // tokenArray["token_2"] = token;
            tokenArray["token_2"] = response.body.token;
            console.log("response body 200", response.body);
        });
    });

    describe("API endpoint for logout", () => {
        it("should remove the token if logout success.", async () => {
            console.log("logout token", tokenArray["token_2"]);
            await request(server).post("/api/logout").set("Authorization", `Bearer ${tokenArray["token_2"]}`).expect(200);

            await request(server).post("/api/user").set("Authorization", `Bearer ${tokenArray["token_2"]}`).expect(401);
        });
    });
});

describe("POST /api/articles", () => {
    describe("API endpoint for articles", () => {
        it("should respond with HTTP 400 if the request body is empty", async () => {
            const response = await request(server)
                .post("/api/articles")
                .set("Authorization", `Bearer ${tokenArray["default"]}`)
                .expect(400);
            console.log("123 response for empty body", response.status, response.body);
        });

        it("should respond with HTTP 401 if the token is invalid", async () => {
            const response = await request(server)
                .post("/api/articles")
                .set("Authorization", `Bearer invalid_token`)
                .send({ "articles_id": "art1", "title": "tit1", "content": "c1", "visibility": "public" })
                .expect(401);
            console.log("response body 404", response.body);
        });

        it("should respond with HTTP 201 if an article has been created.", async () => {
            const response = await request(server)
                .post("/api/articles")
                .set("Authorization", `Bearer ${tokenArray["default"]}`)
                .send({ "articles_id": "art2", "title": "tit2", "content": "c2", "visibility": "logged_in" })
                .expect(201);
            console.log("article created 201 body",response.statusCode, response.body);
        });
    });
});

describe("GET /api/articles", () => {
    describe("API endpoint for articles", () => {
        it("should respond with HTTP 200 and show logged in articles if token is valid and there are logged in articles stored. ", async () => {
            const response = await request(server)
                .get("/api/articles")
                .set("Authorization", `Bearer ${tokenArray["default"]}`)
                .expect(200);
            console.log("articles with valid token", response.body);
            expect(response.body.articles.filter((article) => article.visibility === 'logged_in').length).toBeGreaterThan(0);
        });

        it("should respond with HTTP 200 and show public articles if no token is provided", async () => {
            const response = await request(server).get("/api/articles").expect(200);
            console.log("articles with - no token", response.body);
        });
        it("should respond with HTTP 200 and show public articles  if invalid token is provided", async () => {
            const response = await request(server).get("/api/articles").set("Authorization", `Bearer invalid_token`).expect(200);
            console.log("articles with - invalid token", response.body);
        });
    });
});

describe("Test for article return type according to token validity.", () => {
    article_1 = { "articles_id": "art1", "title": "tit1", "content": "c1", "visibility": "public" };
    article_2 = { "articles_id": "art2", "title": "tit2", "content": "c2", "visibility": "private" };
    article_3 = { "articles_id": "art3", "title": "tit3", "content": "c3", "visibility": "logged_in" };

    it("user that inserted articles should see one of each article type minimum", async () => {
        // authenticate user and get access token
        const login_response = await request(server)
            .post("/api/authenticate")
            .send({
                login: "article_test",
                password: "article_test",
            })
            .expect(200);
        tokenArray['article_test'] = login_response.body.token;
        // send 3 articles
        await request(server)
            .post("/api/articles")
            .set("Authorization", `Bearer ${tokenArray["article_test"]}`)
            .send(article_1)
            .expect(201);
        await request(server)
            .post("/api/articles")
            .set("Authorization", `Bearer ${tokenArray["article_test"]}`)
            .send(article_2)
            .expect(201);
        await request(server)
            .post("/api/articles")
            .set("Authorization", `Bearer ${tokenArray["article_test"]}`)
            .send(article_3)
            .expect(201);
        // read response
        const response = await request(server)
            .get("/api/articles")
            .set("Authorization", `Bearer ${tokenArray["article_test"]}`)
            .expect(200);
        expect(response.body.articles.filter((article) => article.visibility === 'public').length).toBeGreaterThan(0);
        expect(response.body.articles.filter((article) => article.visibility === 'private').length).toBeGreaterThan(0);
        expect(response.body.articles.filter((article) => article.visibility === 'logged_in').length).toBeGreaterThan(0);
        console.log("response >>>", response.body);
    });

    it("new user should not have private articles", async () => {
        // authenticate user and get access token
        const auth_response = await request(server)
            .post("/api/authenticate")
            .send({
                login: "login_true",
                password: "password_true",
            })
            .expect(200);
        tokenArray['new_account'] = auth_response.body.token;

        // make request to get articles with access token
        const article_response = await request(server).get("/api/articles").set("Authorization", `Bearer ${tokenArray['new_account']}`).expect(200);
        expect(article_response.body.articles.filter((article) => article.visibility === 'private').length).toBe(0);
        console.log('no private articles should be present. ',article_response.body)
    });

    it("user with no token should only see public articles", async () => {
        // make request to get articles with access token
        const article_response = await request(server)
            .get("/api/articles")
            .expect(200);
        public_length = article_response.body.articles.filter((article) => article.visibility === 'public').length
        total_length = article_response.body.articles.length
        expect(public_length).toBe(total_length);
        console.log('only public articles should be present. ',article_response.body)
    });
});
