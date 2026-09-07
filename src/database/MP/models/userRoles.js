const moment = require("moment");

const logger = require("../../../utils/logger");
const db = require("../db");
const constants = require("../../../../constants");

let roles;
const getInstance = () => {
    if (roles) return roles;
    roles = db.getTable("userRoles");
    return roles;
};

const addUserRole = async (details) => {
    logger.info(details);

    return getInstance().create(details);
};

const deleteUserRole = async ({ filter }) => {
    logger.info(filter);

    return getInstance().destroy({ where: filter });
};

const getUserRoles = async ({ attributes = {}, filter = {}, options = {} }) => {
    logger.info(attributes, filter, options);

    return getInstance().findAll({ attributes, where: filter, ...options });
};

module.exports = { getUserRoles, deleteUserRole, addUserRole };
