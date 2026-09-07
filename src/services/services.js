const logger = require("../utils/logger");
const servicesModel = require("../database/MP/models/services");

const deleteService = async (filter) => {
    logger.info();

return servicesModel.deleteService(filter);
};

const addService = async (details) => {
    logger.info();

    return servicesModel.addService(details);
};

const updateService = async ({ oldServiceName, ...data }) => {
    logger.info();

    const filter = { serviceName: oldServiceName };
    return promotedBranchesModel.updateService({ filter, data });
};

const getServices = async () => {
    logger.info();

    return promotedBranchesModel.getServices();
};

module.exports = {
    deleteService,
    addService,
    updateService,
    getServices,
};
