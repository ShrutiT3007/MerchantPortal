const httpStatus = require("http-status");

const logger = require("../utils/logger");
const constants = require("../../constants");
const response = require("../utils/response");
const qaServicesService = require("../services/qaServices");

const triggerService = async (req, res, next) => {
    logger.info();

    try {
        const data = await qaServicesService.triggerFlowsForService(req.body.serviceName);

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.QA_SERVICE_TRIGGERED, data));
    } catch (err) {
        next(err);
    }
};

module.exports = { triggerService };
