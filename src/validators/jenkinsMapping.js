const Joi = require("joi");
const constants = require("../../constants");

const addMapping = {
    body: Joi.object({
        promoteJenkins: Joi.number().integer().min(1).required(),
        deployJenkins: Joi.number().integer().min(1).required(),
    }),
};
const deleteMapping = {
    body: Joi.object({
        promoteJenkins: Joi.number().integer().min(1).required(),
        deployJenkins: Joi.number().integer().min(1).required(),
    }),
};

module.exports = { addMapping, deleteMapping };
