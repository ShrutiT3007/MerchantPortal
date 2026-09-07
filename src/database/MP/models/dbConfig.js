const moment = require("moment");

const logger = require("../../../utils/logger");
const db = require("../db");
const constants = require("../../../../constants");

let dbConfig;
const getInstance = () => {
    if (dbConfig) return dbConfig;
    dbConfig = db.getTable("dbConfig");
    return dbConfig;
};

const createDbConfig = async (details) => {
    logger.info(details);

    return getInstance().upsert(details);
};

const deleteDbConfig = async ({ filter }) => {
    logger.info(filter);

    return getInstance().destroy({ where: filter });
};

const updateDbConfig = async ({ filter, data }) => {
    logger.info(filter, data);

    return getInstance().update(data, { where: filter });
};

const getDbConfig = async ({ attributes = {}, filter = {}, options = {} }) => {
    logger.info(attributes, filter, options);

    return getInstance().findAll({ attributes, where: filter, ...options });
};

module.exports = { getDbConfig, updateDbConfig, deleteDbConfig, createDbConfig };
