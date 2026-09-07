const logger = require("../../../utils/logger");
const db = require("../db");

let qaServices;
const getInstance = () => {
    if (qaServices) return qaServices;
    qaServices = db.getTable("qaServices");
    return qaServices;
};

const addMapping = async ({ serviceName, qaFlowId }) => {
    logger.info(serviceName, qaFlowId);

    // findOrCreate relies on the composite primary key to avoid duplicate mappings
    const [mapping] = await getInstance().findOrCreate({ where: { serviceName, qaFlowId } });
    return mapping;
};

const getFlowIdsForService = async ({ serviceName }) => {
    logger.info(serviceName);

    const mappings = await getInstance().findAll({ where: { serviceName }, attributes: ["qaFlowId"] });
    return mappings.map((mapping) => mapping.qaFlowId);
};

module.exports = { addMapping, getFlowIdsForService };
