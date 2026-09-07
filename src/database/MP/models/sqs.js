const moment = require("moment");

const logger = require("../../../utils/logger");
const db = require("../db");

let sqs;

const getInstance = () => {
    if (sqs) return sqs;
    sqs = db.getTable("sqs");
    return sqs;
};

const getQueues = async ({ attributes = {}, filter = {}, options = {} }) => {
    logger.info("Fetching queues", attributes, filter, options);

    return getInstance().findAll({ attributes, where: filter, ...options });
};

const addQueue = async (details) => {
    logger.info("Adding queue", details);

    const date = moment().format("YYYY-MM-DD HH:mm:ss");
    details.createdAt = date;
    details.updatedAt = date;

    return getInstance().create(details);
};

const deleteQueue = async (filter) => {
    logger.info("Deleting queue", filter);

    return getInstance().destroy({ where: filter });
};

const updateQueue = async ({ filter, data }) => {
    logger.info("Updating queue", data, filter);

    const date = moment().format("YYYY-MM-DD HH:mm:ss");
    data.updatedAt = date;

    return getInstance().update(data, { where: filter });
};

module.exports = {
    addQueue,
    deleteQueue,
    updateQueue,
    getQueues,
};
