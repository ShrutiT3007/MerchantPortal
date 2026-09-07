const httpStatus = require("http-status");

const logger = require("../utils/logger");
const constants = require("../../constants");
const jenkinsMappingService = require("../services/jenkinsMapping");
const response = require("../utils/response");

const addMapping = async (req, res, next) => {
    logger.info();

    try {
        const data = await jenkinsMappingService.addMapping(req.body);

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.OK, data));
    } catch (err) {
        next(err);
    }
};

const deleteMapping = async (req, res, next) => {
    logger.info();

    try {
        const data = await jenkinsMappingService.deleteMapping(req.query);

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.OK, data));
    } catch (err) {
        next(err);
    }
};

const getMapping = async (req, res, next) => {
    logger.info();

    try {
        const data = await jenkinsMappingService.getMapping();

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY, data));
    } catch (err) {
        next(err);
    }
};

module.exports = { deleteMapping, addMapping, getMapping };
