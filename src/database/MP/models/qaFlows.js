const moment = require("moment");

const logger = require("../../../utils/logger");
const db = require("../db");
const constants = require("../../../../constants");

let qaFlows;
const getInstance = () => {
    if (qaFlows) return qaFlows;
    qaFlows = db.getTable("qaFlows");
    return qaFlows;
};

const addFlow = async (details) => {
    logger.info(details);

    // Explicitly listing the autoIncrement `id` column as DEFAULT (Sequelize's normal
    // behavior for create()) is resolved by this mysql2 version as literal 0 instead of
    // the next AUTO_INCREMENT value, causing "Duplicate entry '0' for key qa_flows.PRIMARY".
    // Restricting `fields` to the columns we actually supply omits `id` from the INSERT
    // entirely (same as the working upsert() path in testcases.js), letting MySQL assign it.
    const fields = Object.keys(getInstance().rawAttributes).filter((field) => field !== "id");

    return getInstance().create(details, { fields });
};

const deleteFlow = async ({ filter }) => {
    logger.info(filter);

    return getInstance().destroy({ where: filter });
};

const updateFlow = async ({ filter, data }) => {
    logger.info(filter, data);

    return getInstance().update(data, { where: filter });
};

const getFlow = async ({ attributes = {}, filter = {}, options = {} }) => {
    logger.info(attributes, filter, options);

    return getInstance().findAll({ attributes, where: filter, ...options });
};

module.exports = { updateFlow, deleteFlow, addFlow, getFlow };
