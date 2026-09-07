const _ = require("lodash");

const logger = require("../utils/logger");
const Authorization = require("../utils/casbin");
const constants = require("../../constants");
const rolesService = require("./casbinRole");
const userService = require("./user");
const userRoleService = require("./userRoles");
const servicesService = require("../services/services");
const mpDb = require("../database/MP/db");
const eilDb = require("../database/EIL/db");
const mobDb = require("../database/MOB/db");
const eilService = require("./eil");

const addApisToResource = async ({ apiName, resource }) => {
    logger.info();

    return Authorization.getInstance().addNamedGroupingPolicy("g2", apiName, resource);
};

const addResourceHierarchy = async ({ childResource, parentResource }) => {
    logger.info();

    return Authorization.getInstance().addNamedGroupingPolicy("g3", childResource, parentResource);
};

const mapRoleWithResource = async ({ role, resource, accessType }) => {
    logger.info();

    const getAccessArray = (accessType) => {
        const result = [constants.ACCESS_TYPE.READ];

        if (accessType === constants.ACCESS_TYPE.READ) {
            return result;
        }

        result.push(constants.ACCESS_TYPE.WRITE);

        if (accessType === constants.ACCESS_TYPE.DELETE) {
            result.push(constants.ACCESS_TYPE.DELETE);
        }

        return result;
    };

    const accessTypes = getAccessArray(accessType);
    return Promise.all(
        accessTypes.map((access) => {
            return Authorization.getInstance().addPolicy(role, resource, access);
        })
    );
};

const addRoleHierarchy = async ({ childRole, parentRole }) => {
    logger.info();

    return Authorization.getInstance().addGroupingPolicy(childRole, parentRole);
};

const getRolesMappings = async (query) => {
    logger.info();

    return rolesService.getRolesMappings(query);
};

const getApiRoleAndResource = async (query) => {
    logger.info();

    return rolesService.getApiRoleAndResource(query);
};

const getUsers = async (query) => {
    logger.info();

    return userService.getUsers(query);
};

const updateUser = async (details) => {
    logger.info();

    return userService.updateUser(details);
};

const updatePolicy = async ({ ptype, oldPolicy, newPolicy }) => {
    logger.info();

    const isExist = await deletePolicy({ ptype, policy: oldPolicy });

    if (isExist) {
        if (ptype === constants.PTYPE.P) {
            return mapRoleWithResource({ role: newPolicy[0], resource: newPolicy[1], accessType: newPolicy[2] });
        }
        return Authorization.getInstance().addNamedGroupingPolicy(ptype, ...newPolicy);
    }
    return isExist;
};

const deletePolicy = async ({ ptype, policy }) => {
    logger.info();
    if (ptype === constants.PTYPE.P) {
        return Authorization.getInstance().removePolicy(...policy);
    }
    return Authorization.getInstance().removeNamedGroupingPolicy(ptype, ...policy);
};

const addUserRole = async (details) => {
    logger.info();

    userRoleService.addUserRole(details);
};

const addService = async (details) => {
    logger.info();

    return servicesService.addService(details);
};

const deleteService = async (details) => {
    logger.info();

    return servicesService.deleteService(details);
};

const executeQuery = async ({ dbName ,query }) => {
    logger.info();

    let  DBInstance = dbName === "MP" ? mpDb.getDb() : dbName==="MOB" ? mobDb.getDb():eilDb.getDb();
    return DBInstance.query(query, {
        type: DBInstance.QueryTypes.SELECT,
    });
};

const sendMail = async ({subscribers = [] , toAll= true}) => {
    logger.info();

    return eilService.sendMail(subscribers , toAll);
};

module.exports = {
    addRoleHierarchy,
    mapRoleWithResource,
    addApisToResource,
    addResourceHierarchy,
    getRolesMappings,
    getApiRoleAndResource,
    getUsers,
    updateUser,
    updatePolicy,
    deletePolicy,
    addUserRole,
    addService,
    deleteService,
    executeQuery,
    sendMail,
};
