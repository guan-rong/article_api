const { validate_token } = require("../controllers/loginController");

const authenticateJwt = (req, res, next) => {
    try {
        // Get the token from the Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
            return res.status(400).json({ error: "token required for this path." });
        }

        const authenticated = validate_token(token);
        if (!authenticated){
            return res.status(401).json({ error: "invalid token" });
        } 

        req.token = token 
        next();
    } catch (err) {
        console.error("jwt auth error > ", err);
        // If the token is invalid, set req.authenticated to false and return a 401 Unauthorized response
        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = { authenticateJwt };
