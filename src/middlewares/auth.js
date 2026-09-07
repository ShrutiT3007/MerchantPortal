const jwt = require("jsonwebtoken");
const fs = require("fs");

const logger = require("../utils/logger");
const constants = require("../../constants");
const Authorization = require("../utils/casbin");
const commonUtil = require("../utils/common");
const localStorage = require("../utils/localStorage");

const auth = async (req, res, next) => {
    logger.info();
    try {
        let publicKey , privateKey;
        try{
            publicKey = fs.readFileSync(constants.JWT_KEYS.PATH.PUBLIC_KEY, "utf8");
            privateKey = fs.readFileSync(constants.JWT_KEYS.PATH.PRIVATE_KEY, "utf8");
        }
        catch(err){
            publicKey = process.env["rsa.key.pub"];
            privateKey = process.env["rsa.key"];
        }

        if (req.headers["x-api-validation"] && req.headers["x-api-validation"] === process.env.API_KEY) {
            const store = localStorage.getStore();
            store.set("userId", req.params.serviceName);

            return next();
        }

        const accessToken = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken;
       
        if (!accessToken || !refreshToken) {
            throw new Error(constants.ERROR_MESSAGE.SESSION_EXPIRED);
        }
        let payload;
        try {
            payload = jwt.verify(accessToken, publicKey);
            req.userId = payload.userId;
        } catch (err) {
            try {
                payload = jwt.verify(refreshToken, publicKey);
                req.userId = payload.userId;
                const newAccessToken = jwt.sign(
                    {
                        issuer: constants.ACCESS_TOKEN.ISSUER,
                        userId: payload.userId,
                        role: payload.role,
                        issuedAt: new Date().toISOString(),
                        type: constants.ACCESS_TOKEN.NAME,
                    },
                    privateKey,
                    { algorithm: constants.ACCESS_TOKEN.ALGORITHM, expiresIn: constants.ACCESS_TOKEN.EXPIRY }
                );
                res.cookie("accessToken", newAccessToken, { httpOnly: true });
            } catch (err) {
                throw new Error(constants.ERROR_MESSAGE.SESSION_EXPIRED);
            }
        }

        const sub = payload.role;
        const path = commonUtil.getApiName(req.originalUrl, req.params);
        const accessType = getAccessType(req.method);

        const store = localStorage.getStore();
        store.set("userId", payload.userId);

        if (sub.includes(constants.ROLES.ADMIN)) {
            return next();
        } else if (await checkAuthorization(sub, path, accessType)) {
            return next();
        } else {
            throw new Error(constants.ERROR_MESSAGE.UNAUTHORIZED);
        }
    } catch (err) {
        next(err);
    }
};

const getAccessType = (method) => {
    logger.info(method);

    if (method === constants.REQUEST_TYPE.GET) return constants.ACCESS_TYPE.READ;
    else if (method === constants.REQUEST_TYPE.DELETE) return constants.ACCESS_TYPE.DELETE;

    return constants.ACCESS_TYPE.WRITE;
};

const checkAuthorization = async (role, path, accessType) => {
    logger.info();

    for (let index = 0; index < role.length; index++) {
        if (await Authorization.getInstance().enforce(role[index], path, accessType)) return true;
    }
    return false;
};

module.exports = auth;
