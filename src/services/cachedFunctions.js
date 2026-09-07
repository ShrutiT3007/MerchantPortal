const logger = require("../utils/logger");
const cachedFunctionsModel = require("../database/MP/models/cachedFunctions");
const cachedMemory = require("../utils/cachedMemory");

const insertOrUpdate = async (details) => {
    logger.info();

    return cachedFunctionsModel.addOrUpdateFunction(details);
};

const deleteEntry = async (filter) => {
    logger.info();

    return cachedFunctionsModel.deleteEntry({ filter });
};

const getFunctions = async (filter) => {
    logger.info();

    return cachedFunctionsModel.getEntries({ filter });
};

const getFunction = async (filter) => {
    logger.info();

    return cachedFunctionsModel.getEntry({ filter });
};

const loadFunctionsInMemory = async () => {
    logger.info();
    try {
        const data = await getFunctions({});

        data.forEach((row) => {
            cachedMemory.functions[row.name] = row.functionString;
        });
    } catch (err) {
        logger.error(err);
    }
};

module.exports = {
    insertOrUpdate,
    deleteEntry,
    getFunction,
    getFunctions,
    loadFunctionsInMemory,
};
