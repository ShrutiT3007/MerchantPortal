const httpStatus = require("http-status");
const axios = require("axios");
const crypto = require("crypto");

const logger = require("../utils/logger");
const constants = require("../../constants");
const sqsService = require("../services/sqs");
const response = require("../utils/response");
const downloadHistoryService = require("../services/downloadHistory");

const addQueue = async (req, res, next) => {
    logger.info(req.body);
    try {
        const result = await sqsService.addQueue(req.body);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.QUEUE_ADDED, result));
    } catch (err) {
        next(err);
    }
};

const updateQueue = async (req, res, next) => {
    logger.info(req.body);
    try {
        const result = await sqsService.updateQueue(req.body);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.SQS_UPDATED, result));
    } catch (err) {
        next(err);
    }
};

const getQueues = async (req, res, next) => {
    logger.info(req.query);
    try {
        const result = await sqsService.getQueues(req.query);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY, result));
    } catch (err) {
        next(err);
    }
};

const deleteQueue = async (req, res, next) => {
    logger.info(req.body);
    try {
        const result = await sqsService.deleteQueue(req.query);
        if (result === 0) {
            return res.status(httpStatus.NOT_FOUND).json(response.errorResponse(constants.ERROR_MESSAGE.NOT_FOUND));
        }
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.OK, result));
    } catch (err) {
        next(err);
    }
};

const createTxnNotification = async (req, res, next) => {
    logger.info(req.body);
    try {
        const responseData = await sendSQSMessage(req.body.merchantId, req.body.amount);

        res.status(httpStatus.OK).json(response.successResponse("Transaction created successfully", responseData));
    } catch (err) {
        next(err);
    }
};

const retrieveMessages = async(req , res , next) =>{
    logger.info();

    try{
        const {id} = await downloadHistoryService.createEntry();
        sqsService.downloadMessages(req.body , id);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.PROCESSING));
    }catch(err){
        next(err);
    }
}

module.exports = {
    addQueue,
    updateQueue,
    getQueues,
    deleteQueue,
    createTxnNotification,
    retrieveMessages
};
