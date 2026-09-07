const { v4: uuidv4 } = require("uuid");
const morgan = require("morgan");
const moment = require("moment-timezone");
const chalk = require("chalk");
const httpStatus = require("http-status");

const logger = require("../utils/logger");
const localStorage = require("../utils/localStorage");
const response = require("../utils/response");
const constants = require("../../constants");

const setReqId = async (req, res, next) => {
    const store = new Map();
    store.set("reqId", uuidv4());
    localStorage.run(store, () => {
        next();
    });
};

const bodyParser = (req, res, next) => {
    logger.info("Request oringinal name:", req.originalUrl || req.functionName);
    logger.info("Request Method:", req.method);

    if (req.body && Number(req.headers["content-length"])) {
        if (req.headers["content-type"] === "text/plain" && typeof req.body === "string") {
            try {
                req.body = JSON.parse(req.body);
            } catch (error) {
                logger.error("Error while parsing req.body", error);
                next();
            }
        }
        next();
    } else {
        next();
    }
};

const morganLogger = morgan(function (tokens, req, res) {
    let status = tokens.status(req, res);
    if (status) {
        status = status.startsWith("2") ? status : chalk.red(status);
    }
    const store = localStorage.getStore();
    const reqId = store?.get("reqId") || "no-req-id";
    const userId = store?.get("userId") || "no-user";
    return chalk.gray(
        [
            "[",
            moment().format("YYYY-MM-DD HH:mm:ss"),
            "-",
            reqId,
            userId,
            "]",
            tokens.method(req, res),
            tokens.url(req, res),
            status,
            tokens["response-time"](req, res),
            "ms",
            "-",
            tokens.res(req, res, "content-length"),
            "[ IP - ",
            req.ip,
            "]",
        ].join(" ")
    );
});

const errorHandler = (err, req, res, next) => {
    logger.info("inside Error Handler....", err);

    const message = err.message;
    let result = constants.ERROR_RESPONSE[message];

    if (!result) {
        result = {};
        result.errorCode = err.errorCode ? err.errorCode : "ERR-500";
        result.message = `${message}`;
        result.statusCode = err.statusCode ? err.statusCode : httpStatus.INTERNAL_SERVER_ERROR;
    }

    res.status(result.statusCode).send(response.errorResponse(result));
};

module.exports = { morganLogger, bodyParser, setReqId, errorHandler };
