const merchantPortalDb = require("../database/MP/db");
const eilDb = require("../database/EIL/db");
const mobDb = require("../database/MOB/db");
const Authorization = require("../utils/casbin");
const Vault = require("../vault/vault");
const logger = require("../utils/logger");
const constants = require("../../constants");
const cronService = require("./crons");
const dbConfigService = require("./dbConfig");
const cachedFunctionsService = require("./cachedFunctions");

const aws = require("../utils/aws");

async function initialiseServer() {
    logger.info();
    try {
        if (process.env.ENVIRONMENT !== constants.ENVIRONMENT.DEV) {
            await Vault.initilizeVault();
        }
    
        await Promise.all([merchantPortalDb.setDbInstance(), Authorization.setInstance()]);     
    
        try{
            await dbConfigService.loadDbInMemory();
            await cachedFunctionsService.loadFunctionsInMemory();
            await aws.intilizeAWS();
        }             
        catch(err){
            logger.error(err);
        }
        setTimeout(async () => {
            //await cronService.startCrons();
            logger.info(`crons started`); 
        }, 30000);
    } catch (err) {
        logger.error("initialiseServer Error : ", err);
        throw err;
    }
}

module.exports = { initialiseServer };
