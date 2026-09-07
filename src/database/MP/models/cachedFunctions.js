const moment = require("moment");

const logger = require("../../../utils/logger");
const db = require("../db");
const constants = require("../../../../constants");

let cachedFunctions;
const getInstance = () => {
    if (cachedFunctions) return cachedFunctions;
    cachedFunctions = db.getTable("cachedFunctions");
    return cachedFunctions;
};

const addOrUpdateFunction = async (details) => {
    logger.info(details);

    return getInstance().upsert(details);
};

const deleteFunction = async ({ filter }) => {
    logger.info(filter);

    return getInstance().destroy({ where: filter });
};

const getEntry = async ({ attributes = {}, filter = {}, options = {} }) => {
    logger.info(attributes, filter, options);

    return getInstance().findOne({ attributes, where: filter, ...options });
};

const getEntries = async ({ attributes = {}, filter = {}, options = {} }) => {
    logger.info(attributes, filter, options);

    return getInstance().findAll({ attributes, where: filter, ...options });
};

module.exports = { addOrUpdateFunction, deleteFunction, getEntry , getEntries };
