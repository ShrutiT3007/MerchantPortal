const moment = require("moment");

const logger = require("../../../utils/logger");
const db = require("../db");
const constants = require("../../../../constants");

let subscribers;
const getInstance = () => {
    if (subscribers) return subscribers;
    subscribers = db.getTable("subscribers");
    return subscribers;
};

const addEntry = async (details) => {
    logger.info(details);

    return getInstance().create(details);
};

const deleteEntry = async ({ filter }) => {
    logger.info(filter);

    return getInstance().destroy({ where: filter });
};

const getEntries = async ({ attributes = {}, filter = {}, options = {} }) => {
    logger.info(attributes, filter, options);

    return getInstance().findAll({ attributes, where: filter, ...options });
};

const isSubscribed = async ({ filter }) => {
    logger.info();

    const [result] = await db.getDb().query(
        `
                SELECT 
                   *
                FROM user inner join subscribers s on user.email = s.emailId 
                WHERE user.id = :id 
            `,
        {
            replacements: filter,
            type: db.getDb().QueryTypes.SELECT,
        }
    );
    return result ? true : false;
};

module.exports = { addEntry, deleteEntry, getEntries, isSubscribed };
