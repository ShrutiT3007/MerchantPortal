const logger = require("../utils/logger");
const jenkinsMappingModel = require("../database/MP/models/jenkinsMapping");

const deleteMapping = async (filter) => {
    logger.info();

    return jenkinsMappingModel.deleteMapping({ filter });
};

const addMapping = async (details) => {
    logger.info();

    return jenkinsMappingModel.addMapping(details);
};

const getMapping = async () => {
    logger.info();

    return jenkinsMappingModel.getMapping({});
};

module.exports = {
    deleteMapping,
    addMapping,
    getMapping,
};
