const moment = require("moment");

const logger = require("../../../utils/logger");
const db = require("../db");
const constants = require("../../../../constants");

let locks;
const getInstance = () => {
    if (locks) return locks;
    locks = db.getTable("locks");
    return locks;
};

const applyLock = async (id) => {
    logger.info(id);

    const createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
    return getInstance().create({ id, createdAt });
};

const releaseLock = async (filter) => {
    logger.info(filter);

    return getInstance().destroy({ where: filter });
};

const update = async(filter)=>{
    logger.info();

    return getInstance().upsert(filter);
}

module.exports = { applyLock, releaseLock , update };
