const logger = require("../utils/logger");
const constants = require("../../constants");
const qaServicesModel = require("../database/MP/models/qaServices");
const locksService = require("./locks");

const mapFlowToService = async ({ serviceName, qaFlowId }) => {
    logger.info(serviceName, qaFlowId);

    return qaServicesModel.addMapping({ serviceName, qaFlowId });
};

const getFlowIdsForService = async (serviceName) => {
    logger.info(serviceName);

    return qaServicesModel.getFlowIdsForService({ serviceName });
};

const triggerFlow = async (qaFlowId) => {
    logger.info(qaFlowId);

    try {
        await locksService.applylock(qaFlowId + constants.QA_TEST_LOCK_PADDING);
    } catch (err) {
        return { qaFlowId, status: constants.QA_SERVICE_FLOW_STATUS.FAILED, error: constants.ERROR_MESSAGE.FLOW_ID_IN_USE };
    }

    try {
        // required lazily to avoid the qa.js <-> qaFlows.js <-> qaServices.js circular require returning an empty export
        const qaService = require("./qa");
        const result = await qaService.testSync({ testcases: [], flowId: qaFlowId, servicesUrls: {} });
        return { qaFlowId, status: constants.QA_SERVICE_FLOW_STATUS.TRIGGERED, result };
    } catch (err) {
        logger.error(err);
        return { qaFlowId, status: constants.QA_SERVICE_FLOW_STATUS.FAILED, error: err.message };
    }
};

const triggerFlowsForService = async (serviceName) => {
    logger.info(serviceName);

    const qaFlowIds = await getFlowIdsForService(serviceName);

    if (!qaFlowIds.length) {
        throw new Error(constants.ERROR_MESSAGE.QA_SERVICE_NOT_FOUND);
    }

    // run flows one after another so results can be compiled into a single collective response
    const flows = [];
    for (const qaFlowId of qaFlowIds) {
        flows.push(await triggerFlow(qaFlowId));
    }

    const hasFailure = flows.some((flow) => flow.status === constants.QA_SERVICE_FLOW_STATUS.FAILED);
    const hasSuccess = flows.some((flow) => flow.status === constants.QA_SERVICE_FLOW_STATUS.TRIGGERED);
    const status = !hasFailure ? constants.QA_SERVICE_STATUS.SUCCESS : hasSuccess ? constants.QA_SERVICE_STATUS.PARTIAL_SUCCESS : constants.QA_SERVICE_STATUS.FAILED;

    return { serviceName, status, flows };
};

module.exports = { mapFlowToService, getFlowIdsForService, triggerFlowsForService };
