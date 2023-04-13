const express = require("express");
const { createUser } = require("../controllers/userController");
const { login, logout } = require("../controllers/loginController");
const { getArticles, postArticles } = require("../controllers/articleController");
const { authenticateJwt } = require("../middlewares/authenticate");
const router = express.Router();

router.get("/api/articles", getArticles);

router.post("/api/user", authenticateJwt, createUser);
router.post("/api/authenticate", login);
router.post("/api/logout", authenticateJwt, logout);
router.post("/api/articles", authenticateJwt, postArticles);

module.exports = router;
