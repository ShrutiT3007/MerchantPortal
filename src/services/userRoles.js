const logger = require("../utils/logger");
const userRoleModel = require("../database/MP/models/userRoles");

const addUserRole = async (details) => {
    logger.info();

    return userRoleModel.addUserRole(details);
};

const deleteUserRole = async (filter) => {
    logger.info();

    return userRoleModel.deleteUserRole(filter);
};

const getUserRoles = async (filter) => {
    logger.info();

    const data = await userRoleModel.getUserRoles({ filter });
    return data.map((role) => role.roleName);
};

module.exports = {
    getUserRoles,
    deleteUserRole,
    addUserRole,
};
