const moment = require("moment");

const logger = require("../../../utils/logger");
const db = require("../db");
const constants = require("../../../../constants");

let services;
const getInstance = () => {
    if (services) return services;
    services = db.getTable("services");
    return services;
};

const addService = async (details = {}) => {
    logger.info(details);

    return getInstance().create(details);
};

const deleteService = async (filter = {}) => {
    logger.info(filter);

    return getInstance().destroy({ where: filter });
};

const updateService = async ({ filter = {}, data = {} }) => {
    logger.info(filter);

    return getInstance().update(data, { where: filter });
};

const getServices = async ({ filter = {}, attributes = {}, options = {} }) => {
    logger.info(filter, attributes, options);

    return getInstance().findAll({ attributes, where: filter, ...options });
};

module.exports = {
    addService,
    deleteService,
    updateService,
    getServices,
    getInstance
};
