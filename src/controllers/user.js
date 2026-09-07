const httpStatus = require("http-status");

const logger = require("../utils/logger");
const constants = require("../../constants");
const userService = require("../services/user");
const response = require("../utils/response");

const getUserDetails = async (req, res, next) => {
    logger.info();

    try {
        const [data] = await userService.getUsers(req.query);

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY, data));
    } catch (err) {
        next(err);
    }
};
const signOut = async (req, res, next) => {
    logger.info();

    try {
        res.clearCookie(constants.ACCESS_TOKEN.NAME);
        res.clearCookie(constants.REFRESH_TOKEN.NAME);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.USER_SIGN_OUT));
    } catch (err) {
        next(err);
    }
};

const updateUserDetails = async (req, res, next) => {
    logger.info();

    try {
        const data = await userService.updateUser(req.body);

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.USER_UPDATED, data));
    } catch (err) {
        next(err);
    }
};

module.exports = { getUserDetails, signOut, updateUserDetails };
