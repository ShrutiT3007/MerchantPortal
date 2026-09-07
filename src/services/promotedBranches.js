const logger = require("../utils/logger");
const promotedBranchesModel = require("../database/MP/models/promotedBranches");
const servicesService = require("./services");

const getBranch = async (filter) => {
    logger.info();

    return promotedBranchesModel.getBranch({ filter });
};

const deleteService = async (filter) => {
    logger.info();

    return servicesService.deleteService({ filter });
};

const updateBranch = async ({ serviceName, jenkinsId, ...data }) => {
    logger.info(data);

    const filter = { serviceName, jenkinsId };

    return promotedBranchesModel.updateBranch({ filter, data });
};

const addService = async (details) => {
    logger.info();

    return servicesService.addService(details);
};

const updateService = async ({ oldServiceName, newServiceName }) => {
    logger.info();

    const filter = { serviceName: oldServiceName };
    return servicesService.updateService({ filter, data: { serviceName: newServiceName } });
};

const getServices = async () => {
    logger.info();

    return promotedBranchesModel.getServices();
};

module.exports = {
    getBranch,
    deleteService,
    addService,
    updateBranch,
    updateService,
    getServices,
};
