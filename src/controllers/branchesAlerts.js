const httpStatus = require("http-status");

const logger = require("../utils/logger");
const constants = require("../../constants");
const deployedBranchesService = require("../services/deployedBranches");
const promotedBranchesService = require("../services/promotedBranches");
const response = require("../utils/response");

const getBranches = async (req, res, next) => {
    logger.info();

    try {
        const data = await deployedBranchesService.getBranches(req.query);

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY, data));
    } catch (err) {
        next(err);
    }
};

const deployBranch = async (req, res, next) => {
    logger.info();

    try {
        const data = await deployedBranchesService.deployBranch(req.body);

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.OK, data));
    } catch (err) {
        next(err);
    }
};

const addServer = async (req, res, next) => {
    logger.info();

    try {
        const data = await deployedBranchesService.addServer(req.body);

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.OK, data));
    } catch (err) {
        next(err);
    }
};

const deleteServer = async (req, res, next) => {
    logger.info();

    try {
        const data = await deployedBranchesService.deleteServer(req.query);

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.OK, data));
    } catch (err) {
        next(err);
    }
};

const promoteBranch = async (req, res, next) => {
    logger.info();

    try {
        const data = await promotedBranchesService.updateBranch(req.body);

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.OK, data));
    } catch (err) {
        next(err);
    }
};

module.exports = { deleteServer, addServer, getBranches, deployBranch , promoteBranch};
