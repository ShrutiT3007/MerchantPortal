const httpStatus = require("http-status");

const logger = require("../utils/logger");
const constants = require("../../constants");
const mobService = require("../services/mob");
const response = require("../utils/response");
const downloadHistoryService = require("../services/downloadHistory");

const getStatusCount = async (req, res, next) => {
    logger.info();

    try {
        const data = await mobService.getStatusCount(req.query);

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY, data));
    } catch (err) {
        next(err);
    }
};

const getLeads = async (req, res, next) => {
    logger.info();

    try {
        if (req.query.download) {
            const { id } = await downloadHistoryService.createEntry();

            mobService.downloadLeads(req.query, id);

            res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.PROCESSING));
        } else {
            const data = await mobService.getLeads(req.query);

            res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY, data));
        }
    } catch (err) {
        next(err);
    }
};

const pushNotification = async (req , res , next) =>{
    logger.info();

    try{
        const data = await mobService.pushNotification(req.body);
        
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.MESSAGE_PUSHED , data));
        

    }catch(err){
        next(err);
    }
}

module.exports = { getLeads, getStatusCount , pushNotification };
