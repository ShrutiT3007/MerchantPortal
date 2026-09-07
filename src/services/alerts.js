const logger = require("../utils/logger");
const constants = require("../../constants");
const commonUtil = require("../utils/common");

const push = async ({ body, query }) => {
    logger.info();

    const tableName = constants.ALERTS[query.id];
    const model = require(`../database/MP/models/${tableName}`);

    const chatUrl = "";
    const message = "";

    await commonUtil.sendToGoogleChat(message, chatUrl);
    return model.addEntry(body);
};

module.exports = { push };
