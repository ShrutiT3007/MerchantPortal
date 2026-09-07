const constants = require("../../constants");

const BIND_ADDRESS = "0.0.0.0";

const ALLOWED_ORIGINS = [
    'https://merchant-portal.freecharge.in' , "https://merchant-portal-staging-01.fcinternal.in" , "http://localhost:3000", "https://merchant-portal.freechargebiz.in"];

// const redis = {
//     port: parseInt(process.env.REDIS_PORT),
//     host: process.env.REDIS_HOST,
//     maxRetries: constants.REDIS.config.maxRetries,
//     retryDelay: constants.REDIS.config.retryDelay,
//     totalRetryTime: constants.REDIS.config.totalRetryTime,
// };

const DB = {
    maxRetries: constants.DB.config.maxRetries,
    retryDelay: constants.DB.config.retryDelay,
};

const PAYLOAD_CONFIG = {
    body : "20mb",
    text :"20mb"
}

module.exports = { ALLOWED_ORIGINS, BIND_ADDRESS, DB , PAYLOAD_CONFIG };
