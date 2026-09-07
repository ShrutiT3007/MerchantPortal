const Joi = require("joi");

const getDownloadHistory = {
    query: Joi.object({
        pageNumber: Joi.number().integer().min(1).required(),
        limit: Joi.number().integer().min(1).required(),
    }),
};
const getUrl = {
    query: Joi.object({
        s3Key: Joi.string().required(),
    }),
};

module.exports = { getDownloadHistory, getUrl };
