const uuid = require("uuid");
const _ = require("lodash");
const { validate_token, getUserByToken } = require("../controllers/loginController");
const { getArticlesByType, createArticle } = require("../database/article");

exports.getArticles = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    tokenIsValid = validate_token(token);
    user = getUserByToken(token);

    if (tokenIsValid) {
        // return all public articles
        // articles with visibility = 'logged-in'
        // articles which are written by the author.

        const loggedInArticles = getArticlesByType("logged_in") || [];
        const publicArticles = getArticlesByType("public") || [];
        const privateArticles = getArticlesByType("private", user) || [];

        return res.status(200).json({ tokenIsValid, articles: [...publicArticles, ...privateArticles, ...loggedInArticles] });
    } else {
        const publicArticles = getArticlesByType("public") || [];

        return res.status(200).json({ tokenIsValid, articles: publicArticles });
    }
};

exports.postArticles = (req, res, next) => {
    // valid body fields
    // - article_id: string
    // - title: string
    // - content: string
    // - visibility: 'public' | 'private' | 'logged_in':
    if (_.isEmpty(req.body)) {
        return res.status(400).json({ errors: "request body cannot be empty" });
    }

    const { articles_id, title, content, visibility } = req.body;
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    author = getUserByToken(token);

    article = createArticle({ author, articles_id, title, content, visibility });
    return res.status(201).json({ article });
};
