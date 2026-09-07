const moment = require("moment");

const logger = require("../utils/logger");
const locksModel = require("../database/MP/models/locks");

const applylock = async (id) => {
    logger.info();

    return locksModel.applyLock(id);
};

const releaseLock = async (filter = {}) => {
    logger.info();

    return locksModel.releaseLock(filter);
};

const extendLockTime = async(id , offset)=>{
    logger.info();

    filter ={id};
    filter.createdAt = moment().add(offset, "minutes").format("YYYY-MM-DD HH:mm:ss");
    return locksModel.update(filter);
}

module.exports = { applylock, releaseLock , extendLockTime };
