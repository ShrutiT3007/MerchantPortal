const httpStatus = require("http-status");

const logger = require("../utils/logger");
const constants = require("../../constants");
const adminService = require("../services/admin");
const response = require("../utils/response");
const dbConfigService = require("../services/dbConfig");
const cachedFunctionsService = require("../services/cachedFunctions");

const addApisToResource = async (req, res, next) => {
    logger.info(req.body);

    try {
        const result = await adminService.addApisToResource(req.body);

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.API_ADDED, result));
    } catch (err) {
        next(err);
    }
};

const addResourceHierarchy = async (req, res, next) => {
    logger.info(req.body);

    try {
        const result = await adminService.addResourceHierarchy(req.body);

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.RESOURCE_ADDED, result));
    } catch (err) {
        next(err);
    }
};

const mapRoleWithResource = async (req, res, next) => {
    logger.info(req.body);

    try {
        const data = await adminService.mapRoleWithResource(req.body);

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.ROLE_MAPPED, data));
    } catch (err) {
        next(err);
    }
};

const addRoleHierarchy = async (req, res, next) => {
    logger.info();

    try {
        const result = await adminService.addRoleHierarchy(req.body);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.HIERARCHY_ADDED, result));
    } catch (err) {
        next(err);
    }
};

const getUsers = async (req, res, next) => {
    logger.info();

    try {
        const result = await adminService.getUsers(req.query);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY, result));
    } catch (err) {
        next(err);
    }
};

const updateUser = async (req, res, next) => {
    logger.info();

    try {
        const result = await adminService.updateUser(req.body);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.USER_UPDATED, result));
    } catch (err) {
        next(err);
    }
};

const getRolesMappings = async (req, res, next) => {
    logger.info();

    try {
        const result = await adminService.getRolesMappings(req.query);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY, result));
    } catch (err) {
        next(err);
    }
};

const getApiRoleAndResource = async (req, res, next) => {
    logger.info();

    try {
        const result = await adminService.getApiRoleAndResource(req.query);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY, result));
    } catch (err) {
        next(err);
    }
};

const updatePolicy = async (req, res, next) => {
    logger.info();

    try {
        const result = await adminService.updatePolicy(req.body);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.POLICY_UPDATED, result));
    } catch (err) {
        next(err);
    }
};

const deletePolicy = async (req, res, next) => {
    logger.info();

    try {
        const result = await adminService.deletePolicy(req.body);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.POLICY_DELETED, result));
    } catch (err) {
        next(err);
    }
};

const addDbConfig = async (req, res, next) => {
    logger.info();

    try {
        const result = await dbConfigService.createDbConfig(req.body);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.OK, result));
    } catch (err) {
        next(err);
    }
};
const addOrUpdateFunction = async (req, res, next) => {
    logger.info();

    try {
        const result = await cachedFunctionsService.insertOrUpdate(req.body);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.Ok, result));
    } catch (err) {
        next(err);
    }
};
const addUserRole = async (req, res, next) => {
    logger.info();

    try {
        const result = await adminService.addUserRole(req.body);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.ROLE_ADDED, result));
    } catch (err) {
        next(err);
    }
};

const addService = async(req,res,next)=>{
    logger.info();

    try {
        const result = await adminService.addService(req.body);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.SERVICE_ADDED, result));
    } catch (err) {
        next(err);
    }
}

const deleteService = async(req,res,next)=>{
    logger.info();

    try {
        const result = await adminService.deleteService(req.body);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.SERVICES_DELETED, result));
    } catch (err) {
        next(err);
    }
}

const kill = async(req , res, next)=>{
    logger.info();

    process.exit(0);
}

const executeQuery = async(req , res , next)=>{
    logger.info();

    try {
        const result = await adminService.executeQuery(req.body);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.SERVICES_DELETED, result));
    } catch (err) {
        next(err);
    }

}

const triggerMail = async(req , res , next)=>{
    logger.info();

    try{
        await adminService.sendMail(req.body);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.OK));
    }
    catch(err){
        next(err);
    }
}

module.exports = {
    addRoleHierarchy,
    mapRoleWithResource,
    addApisToResource,
    addResourceHierarchy,
    getUsers,
    updateUser,
    getRolesMappings,
    getApiRoleAndResource,
    updatePolicy,
    deletePolicy,
    addUserRole,
    addDbConfig,
    addOrUpdateFunction,
    addService,
    deleteService,
    kill,
    executeQuery,
    triggerMail
};
