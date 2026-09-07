const logger = require("../utils/logger");
const commonStorageModel = require("../database/MP/models/commonStorage");

const insertOrUpdate = async (details) => {
    logger.info();

    return commonStorageModel.upsert(details);
};

const deleteEntry = async (filter) => {
    logger.info();

    return commonStorageModel.deleteEntry({filter});
};

const getData = async (filter) => {
    logger.info();

    return commonStorageModel.getEntry({ filter });
};

module.exports = {
    insertOrUpdate,
    deleteEntry,
    getData,
};
