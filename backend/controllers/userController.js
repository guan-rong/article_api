const uuid = require("uuid");
const _ = require("lodash");
const { addUser, getUser } = require("../database/user");


// POST /api/user – add a user to the database (kept in memory).
// Request Body (JSON):
// - user_id: string
// - login: string
// - password: string
// Response:
// - HTTP 400, if the body is empty;
// - HTTP 201, if the user has been created. The response body can be empty.

exports.createUser = (req, res, next) => {
    
    try {
        if (_.isEmpty(req.body)) {
            console.log('stuck here?')
            throw Error("Request body is empty");
        }

        const { user_id, login, password } = req.body;
        // Check if user already exists
        // const existingUser = _.find(users, { user_id });
        const existingUser = getUser({user_id})
        if (existingUser) {
            return res.status(409).json({ error: "User already exists" });
        }

        // Create new user
        // const user = { id: uuid.v4(), login, password };
        const user = { user_id, login, password };
        addUser(user)
        return res.status(201).json({ message: "User created", user });
    } catch (error) {
        console.error(error)

        if (!req.body) {
            return res.status(400).end();
        }
        return res.status(499).end();
    }
};
