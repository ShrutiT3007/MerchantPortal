const httpStatus = require("http-status");

const logger = require("../utils/logger");
const constants = require("../../constants");
const downloadHistoryService = require("../services/downloadHistory");
const response = require("../utils/response");
const aws = require("../utils/aws");

const getDownloadHistory = async (req, res, next) => {
    logger.info();

    try {
        const data = await downloadHistoryService.getEntries(req.query);

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY, data));
    } catch (err) {
        next(err);
    }
};

const getUrl = async (req, res, next) => {
    logger.info();

    try {
        const url = await aws.getReadUrl(decodeURIComponent(req.query.s3Key));
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY, { url }));
    } catch (err) {
        next(err);
    }
};

module.exports = { getDownloadHistory, getUrl };
