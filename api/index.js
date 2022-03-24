const express = require("express");
const cors = require("cors");

require("dotenv").config();

const route = require("./src/routes");

const PORT = process.env.PORT || 8080;
const app = express();

app.use(cors())
    .use(
        express.urlencoded({
            extended: false,
        })
    )
    .use(express.json())
    .use("/static/v2", route)
    .listen(PORT, () => {
        console.log(`API is running on port: ${PORT}`);
    });
