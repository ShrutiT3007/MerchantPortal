const logger = require("../utils/logger");
const subscribersModel = require("../database/MP/models/subscribers");
const localStorage = require("../utils/localStorage");

const addSubscriber = async (details) => {
    logger.info();

    return subscribersModel.addEntry(details);
};

const deleteSubscriber = async (filter) => {
    logger.info();

    return subscribersModel.deleteEntry({filter});
};

const getSubscribers = async (filter) => {
    logger.info();

    const data = await subscribersModel.getEntries({ filter });
    return data.map((entry) => entry.emailId);
};

const isSubscribed  = async() =>{
    logger.info();

    const store = localStorage.getStore();
    const filter ={ id: store.get("userId")};

    return subscribersModel.isSubscribed({filter});
}

module.exports = {
    addSubscriber,
    deleteSubscriber,
    getSubscribers,
    isSubscribed
};
