const httpStatus = require("http-status");

const logger = require("../utils/logger");
const constants = require("../../constants");
const alertsService = require("../services/alerts");
const response = require("../utils/response");

const push = async (req, res, next) => {
    logger.info();

    try {
        await alertsService.push(req);

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.PROCESSING));
    } catch (err) {
        next(err);
    }
};

module.exports = { push };
