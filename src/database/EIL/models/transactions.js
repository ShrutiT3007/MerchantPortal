const logger = require("../../../utils/logger");
const db = require("../db");

let transactions;
const getInstance = () => {
    if (transactions) return transactions;
    transactions = db.getTable("ei_transaction");
    return transactions;
};

const getEntries = ({ attributes = {}, filter = {}, options = {} }) => {
    logger.info(attributes, filter, options);

    return getInstance().findAll({ attributes, where: filter, ...options });
};

module.exports = { getEntries };
