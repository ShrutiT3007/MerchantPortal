const moment = require("moment");

const logger = require("../../../utils/logger");
const db = require("../db");
const constants = require("../../../../constants");

let commonStorage;
const getInstance = () => {
    if (commonStorage) return commonStorage;
    commonStorage = db.getTable("commonStorage");
    return commonStorage;
};

const upsert = async (details) => {
    logger.info(details);

    return getInstance().upsert(details);
};

const deleteEntry = async ({ filter }) => {
    logger.info(filter);

    return getInstance().destroy({ where: filter });
};

const getEntry = async ({ attributes = {}, filter = {}, options = {} }) => {
    logger.info(attributes, filter, options);

    return getInstance().findOne({ attributes, where: filter, ...options });
};

module.exports = { upsert, deleteEntry, getEntry };
