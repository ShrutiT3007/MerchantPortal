const httpStatus = require("http-status");

const logger = require("../utils/logger");
const constants = require("../../constants");
const qaService = require("../services/qa");
const testcasesService = require("../services/testcases");
const qaFlowsService = require("../services/qaFlows");
const queriesService = require("../services/queries");
const response = require("../utils/response");
const downloadHistoryService = require("../services/downloadHistory");
const dbConfigService = require("../services/dbConfig");
const cachedFunctionsService = require("../services/cachedFunctions");
const aws = require("../utils/aws");
const locksService = require("../services/locks");

const addQuery = async (req, res, next) => {
    logger.info();

    try {
        const data = await queriesService.createQuery(req.body);

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.QUERY_CREATED, data));
    } catch (err) {
        next(err);
    }
};

const getQuery = async (req, res, next) => {
    logger.info();

    try {
        const data = await queriesService.getQueries(req.query);

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY, data));
    } catch (err) {
        next(err);
    }
};

const getDbs = async (req, res, next) => {
    logger.info();

    try {
        const data = await dbConfigService.getDbConfigs({});

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY, data));
    } catch (err) {
        next(err);
    }
};

const test = async (req, res, next) => {
    logger.info();

    try{
        await locksService.applylock(req.body.flowId + constants.QA_TEST_LOCK_PADDING);
    }catch(err){
        return next(Error(constants.ERROR_MESSAGE.FLOW_ID_IN_USE));
    }

    try {
        const { id } = await downloadHistoryService.createEntry();
        qaService.test(req.body, id);

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.PROCESSING));
    } catch (err) {
        next(err);
    }
};
const testSync = async (req, res, next) => {
    logger.info();

    try{
        await locksService.applylock(req.body.flowId + constants.QA_TEST_LOCK_PADDING);
    }catch(err){
        return next(Error(constants.ERROR_MESSAGE.FLOW_ID_IN_USE));
    }

    try {
       
       const data = await qaService.testSync(req.body);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.TEST_SYNC_COMPLETED , data ));
    } catch (err) {
        next(err);
    }
};
const addTestcase = async (req, res, next) => {
    logger.info();

    try {
        const data = await testcasesService.createTestcase(req.body);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.TESTCASE_CREATED, data));
    } catch (err) {
        next(err);
    }
};

const createFlow = async (req, res, next) => {
    logger.info();

    try {
        const data = await qaFlowsService.createFlow(req.body);

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.FLOW_CREATED, data));
    } catch (err) {
        next(err);
    }
};

const getFunction = async (req, res, next) => {
    logger.info();

    try {
        const data = await cachedFunctionsService.getFunctions(req.query);

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.FLOW_CREATED, data));
    } catch (err) {
        next(err);
    }
};

const getflows = async(req , res , next) =>{
    logger.info();

    try{
        const data = await  qaFlowsService.getFlow(req.query);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY, data));
    }catch{
        next(err);
    }
}
const updateFlow = async(req , res , next) =>{
    logger.info();

    try{
        const data = qaFlowsService.updateFlow(req.body);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.FLOW_UPDATED, data));

    }catch(err){

    }
}
module.exports = { createFlow, test, addTestcase, addQuery , getDbs , getQuery , getFunction , testSync };
