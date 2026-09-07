const { CronJob } = require("cron");

const mpDb = require("../database/MP/db");
const eilDb = require("../database/EIL/db");
const mobDb = require("../database/MOB/db");
const Authorization = require("../utils/casbin");
const Vault = require("../vault/vault");
const logger = require("../utils/logger");

const refreshCredentials = async () => {
    logger.info();

    await Vault.refreshDbCredentials();
    await Promise.all([mpDb.setDbInstance(), eilDb.setDbInstance(), mobDb.setDbInstance(), Authorization.setInstance()]);
};

const job = new CronJob(
    "0 22 */5 * *",
    async () => {
        await refreshCredentials();
    },
    null,
    true,
    "Asia/Kolkata"
);

module.exports = job;
