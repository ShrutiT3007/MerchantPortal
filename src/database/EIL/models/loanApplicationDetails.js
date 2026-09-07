const logger = require("../../../utils/logger");
const db = require("../db");

let loanApplicationDetails;
const getInstance = () => {
    if (loanApplicationDetails) return loanApplicationDetails;
    loanApplicationDetails = db.getTable("loanApplicationDetails");
    return loanApplicationDetails;
};

const getEntries = ({ attributes = {}, filter = {}, options = {} }) => {
    logger.info(attributes, filter, options);

    return getInstance().findAll({
        attributes,
        where: filter,
        ...options,
        order: [["created_at", "DESC"]],
    });
};

const getEntry = ({ attributes = {}, filter = {}, options = {} }) => {
    logger.info(attributes, filter, options);

    return getInstance().findOne({ attributes, where: filter, ...options });
};

module.exports = { getEntries, getEntry };
