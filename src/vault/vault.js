const path = require("path");
const axios = require("axios");
const propertiesReader = require("properties-reader");
const vault = require("node-vault");

const logger = require("../utils/logger");
const constants = require("../../constants");

// Construct the path to app.properties
const appPropertiesPath = path.join(__dirname, "application-env.properties");
const databaseropertiesPath = path.join(__dirname, "database.properties");

let vaultInstance;
const properties = propertiesReader(appPropertiesPath).append(databaseropertiesPath);

const client_options = {
    apiVersion: "v1/", // default
    endpoint: properties.get("vault.path"),
};

const initilizeVault = async () => {
    logger.info();

    vaultInstance = vault(client_options);
    const token = await refreshVaultToken();
    await setEnvFromDatabag(token);
    await setDbCredentials();
};

const getVault = async () => {
    logger.info();

    return vaultInstance;
};

const refreshVaultToken = async () => {
    logger.info("Fetching New Token from Vault ");

    const vaultUserName = process.env.VAULT_USERNAME;
    const vaultPassword = process.env.VAULT_PASSWORD;

    const uri = properties.get("vault.path") + properties.get("vault.auth.uri") + vaultUserName;

    const entity = { password: vaultPassword };

    logger.info(`Getting Token for Url ${uri}`);

    const res = await axios.post(uri, entity);

    const token = res.data["auth"]["client_token"];
    logger.info("token fetched");

    vaultInstance.token = token;

    return token;
};

const setEnvFromDatabag = async (token) => {
    logger.info();

    const uri1 = properties.get("vault.databag.prefix") + process.env.NODE_ENV + "/" + properties.get("vault.databag.secret.path");
    const uri2 = properties.get("vault.databag.prefix") + process.env.NODE_ENV + "/" + properties.get("vault.db.secret.path");

    const response1 = await vaultInstance.request({
        method: "GET",
        path: uri1,
    });
    const response2 = await vaultInstance.request({
        method: "GET",
        path: uri2,
    });
    const envData1 = response1.data.data;
    Object.entries(envData1).forEach(([key, value]) => {
        process.env[key] = value;
    });
    const envData2 = response2.data.data;
    Object.entries(envData2).forEach(([key, value]) => {
        process.env[key] = value;
    });

    return [envData1, envData2];
};

const setDbCredentials = async () => {
    logger.info();

    const mpUri = process.env["vault.db.uri"] + process.env["vault.database.merchant_portal"];
    const eilUri = process.env["vault.db.uri"]  + process.env["vault.database.eil"];
    const mobUri = process.env["vault.db.uri"]  + process.env["vault.database.mob"];

    const [MP, MOB, EIL] = await Promise.all([vaultInstance.read(mpUri), ...(process.env.NODE_ENV === constants.ENVIRONMENT.STAGING ? [vaultInstance.read(mpUri), vaultInstance.read(mpUri)] : [])]);

    process.env.MP_DATABASE_PASSWORD = MP.data.password;
    process.env.MP_DATABASE_USERNAME = MP.data.username;
    // if (MOB && EIL) {
    //     process.env.EIL_DATABASE_PASSWORD = EIL.data.password;
    //     process.env.EIL_DATABASE_USERNAME = EIL.data.username;
    //     process.env.MOB_DATABASE_PASSWORD = MOB.data.password;
    //     process.env.MOB_DATABASE_USERNAME = MOB.data.username;
    // }
};

const refreshDbCredentials = async () => {
    logger.info();

    await refreshVaultToken();
    await setDbCredentials();
};

module.exports = {
    getVault,
    initilizeVault,
    refreshDbCredentials,
    refreshVaultToken,
    setDbCredentials,
    setEnvFromDatabag,
};
