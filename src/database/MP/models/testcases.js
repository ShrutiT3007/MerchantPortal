const moment = require("moment");

const logger = require("../../../utils/logger");
const db = require("../db");
const constants = require("../../../../constants");

let testcases;
const getInstance = () => {
    if (testcases) return testcases;
    testcases = db.getTable("testcases");
    return testcases;
};

const createTestcase = async (details) => {
    logger.info(details);

    return getInstance().upsert(details);
};

const deleteTestcase = async ({ filter }) => {
    logger.info(filter);

    return getInstance().destroy({ where: filter });
};

const updateTestcase = async ({ filter, data }) => {
    logger.info(filter, data);

    return getInstance().update(data, { where: filter });
};

const getTestCases = async ({ attributes = {}, filter = {}, options = {} }) => {
    logger.info(attributes, filter, options);

    return getInstance().findAll({ attributes, where: filter, ...options });
};

const getTestCasesInSpecificOrder = async ({ filter = { ids: [], limit: 15, offset: 0 } }) => {
    logger.info();

    return db.getDb().query("SELECT * FROM testcases WHERE id IN (:ids) ORDER BY FIELD(id, :ids) LIMIT :limit OFFSET :offset", {
        replacements: filter,
        type: db.getDb().QueryTypes.SELECT,
    });
};

module.exports = { getTestCases, updateTestcase, deleteTestcase, createTestcase , getTestCasesInSpecificOrder };
