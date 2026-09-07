const logger = require("../../../utils/logger");
const db = require("../db");
const constants = require("../../../../constants");

let jenkinsMapping;
const getInstance = () => {
    if (jenkinsMapping) return jenkinsMapping;
    jenkinsMapping = db.getTable("jenkinsMapping");
    return jenkinsMapping;
};

const addMapping = async (details = {}) => {
    logger.info(details);

    return getInstance().create(details);
};

const deleteMapping = async (filter = {}) => {
    logger.info(filter);

    return getInstance().destroy({ where: filter });
};

const getMapping = async ({ filter = {}, attributes = {}, options = {} }) => {
    logger.info(filter, attributes, options);

    return getInstance().findAll({ attributes, where: filter, ...options });
};

module.exports = {
    addMapping,
    deleteMapping,
    getMapping,
};
