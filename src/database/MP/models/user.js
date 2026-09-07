const moment = require("moment");

const logger = require("../../../utils/logger");
const db = require("../db");
const constants = require("../../../../constants");

let user;
const getInstance = () => {
    if (user) return user;
    user = db.getTable("user");
    return user;
};

const getUsers = async ({ attributes = {}, filter = {}, options = {} }) => {
    logger.info(attributes, options, filter);

    return getInstance().findAll({ attributes, where: filter, ...options });
};

const findUser = async ({ attributes = {}, filter = {}, options = {} }) => {
    logger.info(attributes, filter, options);

    return getInstance().findOne({ attributes, where: filter, ...options });
};

const addUser = async (details) => {
    logger.info(details);

    const date = moment().format("YYYY-MM-DD HH:mm:ss");
    details.createdAt = date;
    details.updatedAt = date;
    details.isEmailVerified = 0;
    details.status = constants.USER.STATUS.PENDING;
    details.role = constants.ROLES.DEFAULT;

    return getInstance().create(details);
};

const deleteUser = async (filter) => {
    logger.info(filter);

    return getInstance().destroy({ where: filter });
};

const updateUser = async ({ filter, data }) => {
    logger.info(filter, data);

    const date = moment().format("YYYY-MM-DD HH:mm:ss");
    data.updatedAt = date;
    return getInstance().update(data, { where: filter });
};

module.exports = {
    addUser,
    deleteUser,
    updateUser,
    getUsers,
    findUser,
};
