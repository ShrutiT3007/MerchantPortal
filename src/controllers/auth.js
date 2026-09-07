const httpStatus = require("http-status");

const logger = require("../utils/logger");
const constants = require("../../constants");
const authService = require("../services/auth");
const rolesService = require("../services/casbinRole");
const response = require("../utils/response");
const userRoleService = require("../services/userRoles");

const signUp = async (req, res, next) => {
    logger.info(req.body);

    try {
        const data = await authService.signUp(req.body);
        await userRoleService.addUserRole({userId:data.id , roleName:constants.ROLES.DEFAULT});

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.USER_CREATED));
    } catch (err) {
        next(err);
    }
};

const signIn = async (req, res, next) => {
    logger.info(req.body);

    try {
        const { accessToken, refreshToken, userData, roleData } = await authService.signIn(req.body);

        res.cookie("accessToken", accessToken, { httpOnly: true });
        res.cookie("refreshToken", refreshToken, { httpOnly: true });

        if (!roleData.includes("admin")) {
            userData.accessToResources = (
                await Promise.all(
                    roleData.map(async (role) => {
                        return rolesService.getMainResourceForRole(role);
                    })
                )
            ).flat();
        }
        else{
            userData.role = constants.ROLES.ADMIN;
        }
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.USER_LOGGEDIN, userData));
    } catch (err) {
        next(err);
    }
};

const sendEmailVerficationOtp = async (req, res, next) => {
    logger.info(req.body);

    try {
        const data = await authService.sendEmailVerficationOtp(req.body);

        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.OTP_SENT, data));
    } catch (err) {
        next(err);
    }
};

const verifyEmail = async (req, res, next) => {
    logger.info();

    try {
        await authService.verifyEmail(req.body);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.USER_SIGNED_UP));
    } catch (err) {
        next(err);
    }
};
module.exports = { signUp, signIn, sendEmailVerficationOtp, verifyEmail };
