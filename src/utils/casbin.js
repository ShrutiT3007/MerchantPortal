const { SequelizeAdapter } = require("casbin-sequelize-adapter");
const { newEnforcer } = require("casbin");

const logger = require("./logger");

let casbinInstance;

const setInstance = async () => {
    logger.info("Initializing Authorization");

    const adapter = await SequelizeAdapter.newAdapter(
        {
            database: process.env.MP_DATABASE_NAME,
            username: process.env.MP_DATABASE_USERNAME,
            password: process.env.MP_DATABASE_PASSWORD,
            host: process.env.MP_DATABASE_URI,
            port: process.env.MP_DATABASE_PORT,
            dialect: "mysql",
            timezone: "+05:30",
        },
        true
    );

    //   // Initialize the enforcer
    const enforcer = await newEnforcer("./src/config/model.conf", adapter);
    await enforcer.enableAutoSave(true);
    await enforcer.loadPolicy();
    casbinInstance = enforcer;
    logger.info("Authorization initialized successfully");
};

const getInstance = () => {
    if (casbinInstance) {
        return casbinInstance;
    }
    throw new Error("use setDbInstance instead");
};

module.exports = { setInstance, getInstance };
