const logger = require("../utils/logger");
const AppError = require("../utils/AppError");
const httpStatus = require("http-status");
const response = require("../utils/response");
const cronService = require("../services/crons");

const refreshCredentials = async (req, res, next) => {
    try {
        logger.info();

        await cronService.refreshCredentials();
    } catch (err) {
        next(err);
    }
};

module.exports = { refreshCredentials };
