const logger = require("../utils/logger");
const queriesModel = require("../database/MP/models/queries");

const createQuery = async (details) => {
    logger.info();

    return queriesModel.createQuery(details);
};

const updateQuery = async({id , ...data}) =>{
    logger.info();

    const filter = {id}
    return queriesModel.updateQuery({filter , data});
}

const deleteQuery = async (filter) => {
    logger.info();

    return queriesModel.deleteQuery(filter);
};

const getQueries = async ({ pageNumber, limit, ...regex }) => {
    logger.info();

    const options = {};
        if (pageNumber && limit) {
            options.offset = (pageNumber - 1) * limit;
            options.limit = limit;
        }
        const filter = {};
    
        Object.entries(regex).map(([key, value]) => {
            filter[key] = { [Op.like]: `${value}%` };
        });
        const attributes = {};

    return queriesModel.getQueries({ filter });    
};

const getQuery = async(filter)=>{
    logger.info();

    return queriesModel.getQuery({filter})
}

module.exports = {
    createQuery,
    updateQuery,
    deleteQuery,
    getQueries,
    getQuery
};
