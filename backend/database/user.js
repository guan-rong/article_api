const uuid = require("uuid");
const _ = require("lodash");

const users = [
    { user_id: "0b9254b2-72b1-46bc-80f7-1bfffdb70a69", login: "default", password: "default" },
    { user_id: "0b9254b2-72b1-46bc-80f7-1bfffdb70a68", login: "article_test", password: "article_test" },
];

function addUser({ user_id, login, password }) {
    users.push({ user_id, login, password });
}

function getUser(query) {
    const [key] = Object.keys(query);
    const [value] = Object.values(query);

    result = _.find(users, { [key]: value });
    return result;
}

module.exports = {
    addUser,
    getUser,
};
