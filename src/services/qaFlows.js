const logger = require("../utils/logger");
const qaFlowsModel = require("../database/MP/models/qaFlows");
const qaServicesService = require("./qaServices");

const createFlow = async ({ serviceName, ...details }) => {
    logger.info();

    const flow = await qaFlowsModel.addFlow(details);
    await qaServicesService.mapFlowToService({ serviceName, qaFlowId: flow.id });
    return flow;
};

const deleteFlow = async (filter) => {
    logger.info();

    return qaFlowsModel.deleteFlow(filter);
};

const getFlow = async (filter) => {
    logger.info();

    return qaFlowsModel.getFlow({ filter });
};

const updateFlow = async ({ id, ...data }) => {
    logger.info();

    const filter = { id };

    return qaFlowsModel.updateFlow({ data, filter });
};

module.exports = {
    createFlow,
    deleteFlow,
    getFlow,
    updateFlow,
};
