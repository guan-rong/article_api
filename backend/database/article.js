const uuid = require("uuid");

const articles = {
    public: [{ "articles_id": "public", "title": "public", "content": "public", "visibility": "public" }],
};

function createArticle({ author, articles_id, title, content, visibility }) {
    const type = visibility === "private" ? author : visibility;
    const article = { articles_id, title, content, visibility };

    if (!articles[type]) {
        articles[type] = [];
    }
    articles[type].push(article);

    return article;
}

function getArticlesByType(visibility, author) {
    switch (visibility) {
        case "private":
            return articles[author];
        case "public":
            return articles["public"];
        case "logged_in":
            return articles["logged_in"];
    }
}

module.exports = {
    createArticle,
    getArticlesByType,
};
