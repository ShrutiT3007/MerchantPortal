const moment = require("moment");

const logger = require("../../../utils/logger");
const db = require("../db");
const constants = require("../../../../constants");
const servicesModel = require("./services");

let deployedBranches;
const getInstance = () => {
    if (deployedBranches) return deployedBranches;
    deployedBranches = db.getTable("deployedBranches");
    return deployedBranches;
};

const getBranches = async ({ attributes = {}, filter = {}, options = {} }) => {
    logger.info(attributes, options, filter);

    const DBInstance = db.getDb();

    let whereClauses = [];
    let replacements = {};

    // Dynamically build WHERE clauses based on keys in filter
    for (const key in filter) {
        const value = filter[key];

        if (Array.isArray(value) && value.length > 0) {
            whereClauses.push(`s.${key} IN (:${key})`);
            replacements[key] = value;
        } else if (typeof value === 'string' || typeof value === 'number') {
            whereClauses.push(`s.${key} = :${key}`);
            replacements[key] = value;
        }
        // Skips undefined/null/empty filters
    }

    const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
        SELECT 
            s.ip, branchName, status, 
            serviceName, serverName, chatUrl, 
            personName 
        FROM deployed_branches AS p
        right JOIN services AS s ON p.ip = s.ip
        ${whereClause}
    `;

    const result = await DBInstance.query(query, {
        replacements,
        type: DBInstance.QueryTypes.SELECT,
    });

    return result;
};


const deleteServer = async (filter = {}) => {
    logger.info(filter);

    return getInstance().destroy({ where: filter });
};

const update = async ({ filter = {}, data = {} }) => {
    logger.info(filter, data);

    return getInstance().upsert({...data,...filter});
};

module.exports = {
    deleteServer,
    update,
    getBranches,
};
