const { Sequelize } = require("sequelize");

const logger = require("../utils/logger");
const dbConfigModel = require("../database/MP/models/dbConfig");
const constants = require("../../constants");
const cachedMemory = require("../utils/cachedMemory");
const config = require("../config/config").DB;

const createDbConfig = async (details) => {
    logger.info();

    return dbConfigModel.createDbConfig(details);
};

const updateDbConfig = async ({ id, ...data }) => {
    logger.info();

    const filter = { id };
    return dbConfigModel.updateDbConfig({ filter, data });
};

const deleteDbConfig = async (filter) => {
    logger.info();

    return dbConfigModel.deleteDbConfig(filter);
};

const getDbConfigs = async (filter) => {
    logger.info();

    return dbConfigModel.getDbConfig({ filter });
};

const createDbInstance = async (details) => {
    logger.info();

    const sequelize = new Sequelize(details.databaseName, details.userName, details.password, {
        host: details.uri,
        port: details.port,
        dialect: "mysql",
        timezone: "+05:30",
        logging: true,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    });
    let retries = 0;
    while (retries < config.maxRetries) {
        try {
            await sequelize.authenticate();
            return sequelize;
        } catch (err) {
            logger.error(err);
            retries++;
        }
    }
    throw new Error(constants.ERROR_MESSAGE.DB_CONNECTION);
};

const loadDbInMemory = async () => {
    logger.info();
    try {
        const data = await getDbConfigs({}); 
        data.forEach(async (row) => {
            cachedMemory.dbs[row.id] = await createDbInstance(row.data);
            logger.info(`${row.name} connected `);
        });
    } catch (err) {
        logger.error(err);
    }
};

module.exports = {
    createDbConfig,
    updateDbConfig,
    deleteDbConfig,
    loadDbInMemory,
    getDbConfigs
};
