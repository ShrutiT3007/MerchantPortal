const moment = require("moment");

const logger = require("../../../utils/logger");
const db = require("../db");
const constants = require("../../../../constants");

let promotedBranches;
const getInstance = () => {
    if (promotedBranches) return promotedBranches;
    promotedBranches = db.getTable("promotedBranches");
    return promotedBranches;
};

const getBranch = async ({ attributes = {}, filter = {}, options = {} }) => {
    logger.info(attributes, options, filter);

    const DBInstance = db.getDb();

    const [results] = await DBInstance.query(
        `
            select p.branchName 
            from promoted_branches p 
            inner join 
            jenkins_mapping j 
            on p.jenkinsId = j.promoteJenkins 
            where j.deployJenkins = :jenkinsId and p.serviceName = :serviceName`,
        {
            replacements: filter,
            type: DBInstance.QueryTypes.SELECT,
        }
    );

    return results;
};

const addService = async (details = {}) => {
    logger.info(details);

    const date = moment().format("YYYY-MM-DD HH:mm:ss");
    details.createdAt = date;
    details.updatedAt = date;

    return getInstance().create(details);
};

const deleteService = async (filter = {}) => {
    logger.info(filter);

    return getInstance().destroy({ where: filter });
};

const updateService = async ({ filter = {}, data = {} }) => {
    logger.info(filter);

    return getInstance().update(data, { where: filter });
};

const updateBranch = async ({ filter = {}, data = {} }) => {
    logger.info(filter, data);

    return getInstance().upsert({ ...data, ...filter });
};

const getServices = async ({ filter = {}, attributes = {}, options = {} }) => {
    logger.info(filter, attributes, options);

    return getInstance().findAll({ attributes, where: filter, ...options });
};

module.exports = {
    addService,
    deleteService,
    getBranch,
    updateBranch,
    updateService,
    getServices,
};
