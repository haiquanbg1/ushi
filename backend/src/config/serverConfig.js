const createError = require("http-errors");
const path = require("path");
const logger = require("morgan");
const express = require("express");
const cors = require("cors");
const apiRouter = require("../routes/api");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const { corsOptions } = require("../config/corsOptions");
const http = require("http");

module.exports = (app) => {
    app.use(
        session({
            secret: process.env.SECRET_KEY,
            resave: false,
            saveUninitialized: false,
        })
    );

    // middleware
    app.use(logger("dev"));
    app.use(express.json({ limit: "100mb" }));
    app.use(express.urlencoded({ extended: true, limit: "100mb" }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, "public")));
    app.use(bodyParser.json());

    // routes
    app.use("/api/v1", cors(corsOptions), apiRouter);

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        next(createError(404));
    });

    // error handler
    app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get("env") === "development" ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.send(err);
    });

    const server = http.createServer(app);

    // Bắt đầu lắng nghe trên một cổng cụ thể, ví dụ: cổng 8080
    const port = process.env.PORT || 8080;
    server.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    });

    return server;
};
