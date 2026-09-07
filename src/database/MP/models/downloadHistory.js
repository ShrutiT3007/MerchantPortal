const moment = require("moment");

const logger = require("../../../utils/logger");
const db = require("../db");
const constants = require("../../../../constants");

let downloadHistory;
const getInstance = () => {
    if (downloadHistory) return downloadHistory;
    downloadHistory = db.getTable("downloadHistory");
    return downloadHistory;
};

const createEntry = async (details) => {
    logger.info(details);

    const date = moment().format("YYYY-MM-DD HH:mm:ss");
    details.createdAt = date;
    details.updatedAt = date;

    // Same mysql2/Sequelize DEFAULT-on-autoIncrement issue as qa_flows: listing `id` as
    // DEFAULT resolves to literal 0 instead of the next AUTO_INCREMENT value, causing
    // "Duplicate entry '0' for key download_history.PRIMARY". Restricting `fields` omits
    // `id` from the INSERT entirely so MySQL assigns it normally.
    const fields = Object.keys(getInstance().rawAttributes).filter((field) => field !== "id");

    return getInstance().create(details, { fields });
};

const updateEntry = async ({ filter, data }) => {
    logger.info(filter, data);

    const date = moment().format("YYYY-MM-DD HH:mm:ss");
    data.updatedAt = date;
    return getInstance().update(data, { where: filter });
};

const getEntries = async ({ attributes = {}, filter = {}, options = {} }) => {
    logger.info(attributes, filter, options);

    return getInstance().findAll({ attributes, where: filter, ...options });
};

module.exports = { createEntry, updateEntry, getEntries };
