const { Sequelize } = require("sequelize");
const logger = require("../../utils/logger");
const config = require("../../config/config").DB;
const constants = require("../../../constants");
const tableSchema = require("./schema");

let database;
const TableInstances = {};

const setDbInstance = async () => {
    logger.info("EIL");
    try{
    const sequelize = new Sequelize(process.env.EIL_DATABASE_NAME, process.env.EIL_DATABASE_USERNAME, process.env.EIL_DATABASE_PASSWORD, {
        host: process.env.EIL_DATABASE_URI,
        port: process.env.EIL_DATABASE_PORT,
        dialect: "mysql",
        dialectOptions: {
            multipleStatements: true,
        },
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
            database = sequelize;

            Object.entries(tableSchema).forEach(([tableName, table]) => {
                TableInstances[tableName] = sequelize.define(table.name, table.schema, table.options);
            });

            logger.info("EIL Database connected");
            return;
        } catch (err) {
            logger.error("error connecting with eil",err);
            retries++;
        }
    }
    throw new Error(constants.ERROR_MESSAGE.DB_CONNECTION);
}
catch(err){
    logger.error("eil error" , err);
    throw err;
}
};

const getDb = () => {
    if (database) return database;

    throw new Error("use initilize db instead");
};

const getTable = (tableName) => {
    if (TableInstances[tableName]) return TableInstances[tableName];

    throw new Error("table not found");
};

module.exports = { getDb, setDbInstance, getTable };
