const httpStatus = require("http-status");

const logger = require("../utils/logger");
const constants = require("../../constants");
const eilService = require("../services/eil");
const response = require("../utils/response");
const downloadHistoryService = require("../services/downloadHistory");

const getLoanApplications = async (req, res, next) => {
    logger.info();

    try {
        const data = await eilService.getApplications(req.query);

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY, data));
    } catch (err) {
        next(err);
    }
};

const getData = async (req, res, next) => {
    logger.info();

    try {
        const data = await eilService.getSummaryData({ filter: req.query });

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY, data));
    } catch (err) {
        next(err);
    }
};

const subscribe = async (req, res, next) => {
    logger.info();

    try {
        await eilService.subscribe(req.body);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.SUBSCRIBED));
    } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
            res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.ALREADY_SUBSCRIBED));
        } else {
            next(err);
        }
    }
};

const unSubscribe = async (req, res, next) => {
    logger.info();

    try {
        await eilService.unSubscribe(req.body);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.UNSUBSCRIBED));
    } catch (err) {
        next(err);
    }
};
const isSubscribed = async (req, res, next) => {
    logger.info();

    try {
        const data = await eilService.isSubscribed(req.body);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY, data));
    } catch (err) {
        next(err);
    }
};

const getNonMigratedMerchants = async (req, res, next) => {
    logger.info({ query: req.query }, "Fetching Non-Migrated Merchants");

    try {
        const { startDate, download } = req.query;

        if (!startDate) {
            return res.status(httpStatus.BAD_REQUEST)
                .json(response.errorResponse("Start date is required"));
        }

        if (download === "true") {
            eilService.downloadNonMigratedMerchants(startDate, req.user?.id)
                .catch(err => logger.error({ userId: req.user?.id, err }, "Download failed"));

            return res.status(httpStatus.OK).json(
                response.successResponse(constants.SUCCESS_MESSAGE.PROCESSING)
            );
        }

        const data = await eilService.getNonMigratedMerchants(startDate);
        return res.status(httpStatus.OK).json(
            response.successResponse(constants.SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY, data)
        );

    } catch (err) {
        next(err);
    }
};

module.exports = { getLoanApplications, getData, subscribe, unSubscribe, isSubscribed, getNonMigratedMerchants };
