const Joi = require("joi");
const constants = require("../../constants");

const test = {
  body: Joi.object({
    testcases: Joi.array().required(),
    flowId: Joi.number().integer().min(1),
    servicesUrls: Joi.object().required(),
  }),
};

const addTestcases = {
    body: Joi.object({
        description : Joi.string().required(),
        method: Joi.string().valid(...Object.values(constants.REQUEST_TYPE).map(v => v.toLowerCase())).required(),
        url : Joi.string().required(),
        body: Joi.object(),
        headers: Joi.object(),
        expectedOutput : Joi.object().required(),
        dbQueries : Joi.string().optional(),
        params:Joi.object(),
        delay: Joi.number().integer().min(1).required(),
    })
}

const createFlow = {
    body: Joi.object({
        flowName : Joi.string().required(),
        flow : Joi.object().required(),
        data : Joi.object().required(),
    })
}

const addQueries = {
    body:Joi.object({
        dbId : Joi.number().integer().min(1),
        query : Joi.string().required(),
        queryType: Joi.string().valid("SELECT" , "UPDATE" , "INSERT" , "DELETE")
    })
}

const getQueries = {
    query: Joi.object({
        id: Joi.number().integer().min(1),
        query : Joi.string().optional(),
        queryType : Joi.string().optional(),
        pageNumber : Joi.number().integer().min(1),
        limit : Joi.number().integer().min(1),
    })
}

module.exports = { test , createFlow , addQueries , addTestcases , getQueries };
