const moment = require("moment");

const logger = require("../../../utils/logger");
const db = require("../db");
const constants = require("../../../../constants");

let queries;
const getInstance = () => {
    if (queries) return queries;
    queries = db.getTable("queries");
    return queries;
};

const createQuery = async (details) => {
    logger.info(details);

    return getInstance().create(details);
};

const deleteQuery = async ({ filter }) => {
    logger.info(filter);

    return getInstance().destroy({ where: filter });
};

const updateQuery = async ({ filter, data }) => {
    logger.info(filter, data);

    return getInstance().update(data, { where: filter });
};

const getQueries = async ({ attributes = {}, filter = {}, options = {} }) => {
    logger.info(attributes, filter, options);

    return getInstance().findAll({ attributes, where: filter, ...options });
};

const getQuery = async ({ attributes = {}, filter = {}, options = {} }) => {
    logger.info(attributes, filter, options);

    return getInstance().findOne({ attributes, where: filter, ...options });
};

module.exports = { getQueries, updateQuery, deleteQuery, createQuery , getQuery };
