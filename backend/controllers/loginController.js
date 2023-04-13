const jwt = require("jsonwebtoken");
// const { validationResult } = require("express-validator");
const uuid = require("uuid").v1;
const config = require("../configs/config");
const { getUser } = require("../database/user");
const _ = require("lodash");

let valid_tokens = {};
exports.login = (req, res, next) => {
    try {
        if (_.isEmpty(req.body)) {
            return res.status(400).json({ errors: "request body cannot be empty" });
        }

        // Get the login and password from the request body
        let { login, password } = req.body;

        // Find the user with the given login and password
        // const user = users.find((u) => u.login === login);
        const user = getUser({ login });
        if (!user) {
            return res.status(404).json({ message: "Invalid login" });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Generate a JWT token
        // const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
        // token = jwt.sign({ id: user.id, iat: Date.now() }, process.env.JWT_SECRET || config.JWT_SECRET);
        token = uuid();

        // save the token
        valid_tokens[token] = login;

        // Return the token
        res.status(200).json({ token });
    } catch (error) {
        console.log(error);
    }
};

exports.validate_token = (token) => {
    return Boolean(valid_tokens[token]);
};

exports.getUserByToken = (token) => {
    return valid_tokens[token];
};

exports.logout = (req, res, next) => {
    try {
        const { token } = req;
        delete valid_tokens[token];
        return res.status(200).end();
    } catch (error) {
        console.error(err.stack);
        // return res.status(500).end();
    }
};
