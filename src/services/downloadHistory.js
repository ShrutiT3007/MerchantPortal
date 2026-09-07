const logger = require("../utils/logger");
const downloadHistoryModel = require("../database/MP/models/downloadHistory");
const localStorage = require("../utils/localStorage");
const constants = require("../../constants");

const getEntries = async ({ pageNumber, limit }) => {
    logger.info();

    const options = {
        offset: (pageNumber - 1) * limit,
        limit: limit,
        order: [["createdAt", "DESC"]],
    };
    const store = localStorage.getStore();
    const filter = { userId: store.get("userId") || "no-user" };
    const attributes = {};

    return downloadHistoryModel.getEntries({ options, filter, attributes });
};

const updateEntry = async ({ data, id }) => {
    logger.info();

    const store = localStorage.getStore();
    const filter = { userId: store.get("userId") || "no-user", id: id };

    return downloadHistoryModel.updateEntry({ filter, data });
};

const createEntry = async () => {
    logger.info();

    const store = localStorage.getStore();
    const details = { userId: store.get("userId") || "no-user", status: constants.DOWNLOAD_HISTORY_STATUS.IN_PROGRESS };

    return downloadHistoryModel.createEntry(details);
};

module.exports = { createEntry, updateEntry, getEntries };
