const logger = require("../../../utils/logger");
const db = require("../db");
const constants = require("../../../../constants");

let leads;
const getInstance = () => {
    if (leads) return leads;
    leads = db.getTable("leads");
    return leads;
};

const getStatusCount = async ({ attributes = {}, filter = {}, options = {} }) => {
    logger.info(attributes, options, filter);

    const results = await db.getDb().query(
        `
            SELECT 
                COUNT(status) AS count,
                IFNULL(status, 'TOTAL') AS status
            FROM leads
            WHERE leads.${filter.rangeKey} >= :from AND leads.${filter.rangeKey} < :to
            GROUP BY status WITH ROLLUP;
        `,
        {
            replacements: filter,
            type: db.getDb().QueryTypes.SELECT,
        }
    );

    return results;
};

const getLeads = async ({ attributes = {}, filter = {}, options = {} }) => {
    logger.info(attributes, filter, options);

    return getInstance().findAll({ attributes, where: filter, ...options });
};

const getLeadsStream = async ({ attributes = undefined, filter = {}, options = {} }) => {
    logger.info(attributes, filter, options);

    const database = db.getDb();
    const connectionManager = database.connectionManager;
    const connection = await connectionManager.getConnection();
    const queryGenerator = database.dialect.queryGenerator;

    const query = queryGenerator.selectQuery("leads", { attributes, where: filter, ...options });
    logger.info(`Executing Query ${query}`);
    const stream = connection.query(query).stream();

    return stream;
};

module.exports = {
    getStatusCount,
    getLeads,
    getLeadsStream,
};
