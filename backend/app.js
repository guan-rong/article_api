const express = require("express");
const router = require("./routes/routes");
const dotenv = require("dotenv");
const config = require("./configs/config");

dotenv.config();
const app = express();
const port = process.env.PORT || config.PORT;

app.use(express.json());

// Register routes
app.use("/", router);

// Default error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    // res.status(500).send('Internal Server Error');
});

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = server;
