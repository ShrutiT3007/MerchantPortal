const Joi = require("joi");
const constants = require("../../constants");

const getBranches = {
    query: Joi.object({
        ip: Joi.string().optional(),
    }),
};

const deployBranch = {
    body: Joi.object({
        jenkinsId: Joi.number().integer().min(1).required(),
        ip: Joi.string().required(),
        serviceName: Joi.string().required(),
        status: Joi.boolean().strict().optional(),
        personName: Joi.string().optional(),
        branchName : Joi.string().optional(),
        env:Joi.string().optional(),
    }),
};

const updateBranch = {
    body: Joi.object({
        jenkinsId: Joi.number().integer().min(1).required(),
        serviceName: Joi.string().required(),
        branchName: Joi.string().required(),
    }),
};

const addService = {
    body: Joi.object({
        serviceName: Joi.string().required(),
        serverName: Joi.string().required(),
        ip: Joi.string().required(),
        chatUrl: Joi.string().required(),
    }),
};

module.exports = { getBranches, deployBranch , addService , updateBranch };
