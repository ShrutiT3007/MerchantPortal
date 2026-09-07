const winston = require("winston");
const path = require("path");
const DailyRotateFile = require("winston-daily-rotate-file");
const moment = require("moment-timezone");
const localStorage = require("../utils/localStorage");

const constants = require("../../constants");

const PROJECT_ROOT = path.join(__dirname, "..");

const options = {
    file: constants.LOGGER.FILE,
    console: constants.LOGGER.CONSOLE,
};

const logLikeFormat = {
    transform(info) {
        const { timestamp, message, stack } = info;
        const level = info[Symbol.for("level")];
        const args = info[Symbol.for("splat")];
        const strArgs = args ? args.map(JSON.stringify).join(" ") : "";
        const store = localStorage.getStore();
        const reqId = store?.get("reqId") || "no-req-id";
        const userId = store?.get("userId") || "no-user";

        let infoMessage = `${timestamp} ${level}: ${userId ? `userId ${userId} ` : ""}${reqId ? `reqId ${reqId} ` : ""}`;

        const msg = typeof message === "object" ? JSON.stringify(message) : message;
        infoMessage += `${msg} ${strArgs}`;

        if (level === "error") infoMessage += `\n${stack}`;

        info[Symbol.for("message")] = infoMessage;
        return info;
    },
};

const getFormattedDate = () => {
    return moment().format();
};
const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({
            format: getFormattedDate,
        }),
        winston.format.errors({ stack: true }),
        logLikeFormat
    ),
    transports: [new winston.transports.Console(options.console), new DailyRotateFile(options.file)],
    exitOnError: false, // do not exit on handled exceptions
});

logger.stream = {
    write: function (message) {
        logger.info(message);
    },
};

/**
 * Attempts to add file and line number info to the given log arguments.
 */
function formatLogArguments(args) {
    args = Array.prototype.slice.call(args);

    const stackInfo = getStackInfo(1);

    if (stackInfo) {
        // get file path relative to project root
        const calleeStr = `(${stackInfo.relativePath}:${stackInfo.line}:${stackInfo.method && stackInfo.method})`;

        if (typeof args[0] === "string") {
            args[0] = calleeStr + " " + args[0];
        } else {
            args.unshift(calleeStr);
        }
    }

    return args;
}

/**
 * Parses and returns info about the call stack at the given index.
 */
function getStackInfo(stackIndex) {
    const stacklist = new Error().stack.split("\n").slice(3);
    // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
    // do not remove the regex expresses to outside of this method (due to a BUG in node.js)
    const stackReg = /at\s+(.*?)\s+\((.*?):(\d*):(\d*)\)/;
    const stackReg2 = /at\s+(.*?):(\d*):(\d*)/;

    const str = stacklist[stackIndex] || stacklist[0];
    const sp = stackReg.exec(str) || stackReg2.exec(str);

    if (sp && sp.length === 5) {
        return {
            method: sp[1],
            relativePath: path.relative(PROJECT_ROOT, sp[2]),
            line: sp[3],
            pos: sp[4],
            file: path.basename(sp[2]),
            stack: stacklist.join("\n"),
        };
    }
}
// A custom logger interface that wraps winston, making it easy to instrument
// code and still possible to replace winston in the future.

const info = function () {
    logger.info.apply(logger, formatLogArguments(arguments));
};

const warn = function () {
    logger.warn.apply(logger, formatLogArguments(arguments));
};
const error = function () {
    logger.error.apply(logger, formatLogArguments(arguments));
};

const stream = logger.stream;

module.exports = {
    info,
    warn,
    error,
    stream,
};

module.exports.debug = module.exports.log = function () {
    logger.debug.apply(logger, formatLogArguments(arguments));
};
