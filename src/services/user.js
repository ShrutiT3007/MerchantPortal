const { Op } = require("sequelize");
const argon = require("argon2");

const logger = require("../utils/logger");
const UserModel = require("../database/MP/models/user");

const getUsers = async ({ pageNumber, limit, ...regex }) => {
    logger.info();

    const options = {};
    if (pageNumber && limit) {
        options.offset = (pageNumber - 1) * limit;
        options.limit = limit;
    }
    const filter = {};

    Object.entries(regex).map(([key, value]) => {
        filter[key] = { [Op.like]: `${value}%` };
    });
    const attributes = { exclude: ["hashedPassword"] };

    return UserModel.getUsers({ filter, options, attributes });
};

const updateUser = async ({ email, password, ...data }) => {
    logger.info(data);

    const filter = { email };

    if (password) {
        data.hashedPassword = await argon.hash(password);
    }

    return UserModel.updateUser({ filter, data });
};

const findUserByEmail = async ({ email }) => {
    logger.info();

    return UserModel.findUser({ filter: { email } });
};

const findUserByUsername = async ({ username }) => {
    logger.info();

    return UserModel.findUser((filter = { username }));
};

const addUser = async (details) => {
    logger.info();

    return UserModel.addUser(details);
};

module.exports = {
    updateUser,
    getUsers,
    findUserByEmail,
    findUserByUsername,
    addUser,
};
