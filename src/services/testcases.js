const logger = require("../utils/logger");
const testcasesModel = require("../database/MP/models/testcases");

const createTestcase = async (details) => {
    logger.info();

    return testcasesModel.createTestcase(details);
};

const updateTestcase = async ({ id, ...data }) => {
    logger.info();

    const filter = { id };
    return testcasesModel.updateTestcase({ filter, data });
};

const deleteTestcase = async (filter) => {
    logger.info();

    return testcasesModel.deleteTestcase(filter);
};

const getTestcases = async (filter) => {
    logger.info();

    return testcasesModel.getTestCases({ filter });
};

const getTestCasesInSpecificOrder = async (pageNumber, limit, ids) => {
    logger.info();

    const filter = {
        ids,
        offset: (pageNumber - 1) * limit,
        limit,
    };
    return testcasesModel.getTestCasesInSpecificOrder({ filter });
};

module.exports = {
    createTestcase,
    updateTestcase,
    deleteTestcase,
    getTestcases,
    getTestCasesInSpecificOrder,
};
