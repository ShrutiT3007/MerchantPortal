const Joi = require("joi");

const addQueue = {
    body: Joi.object({
        url: Joi.string().uri().required(),
        cronTime: Joi.string().optional(),
        threshold: Joi.number().integer().min(0).required(),
        chatUrl: Joi.string().uri().required(),
        name: Joi.string().required(),
        alertDelay : Joi.number().optional(),
        isActive: Joi.boolean().strict()
    }),
};

const updateQueue = {
    body: Joi.object({
        id: Joi.number().integer().min(1).required(),
        chatUrl: Joi.string().optional(),
        cronTime: Joi.string().optional(),
        threshold: Joi.number().integer().min(0).optional(),
        chatUrl: Joi.string().uri().optional(),
        name: Joi.string().optional(),
        isActive: Joi.boolean().optional(),
        alertDelay: Joi.number().optional()
    }),
};

const getQueues = {
    query: Joi.object({
        pageNumber: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).optional(),
        id: Joi.number().integer().min(1).optional(),
        cronTime: Joi.string().optional(),
        name: Joi.string().optional(),
    }),
};

const deleteQueue = {
    query: Joi.object({
        id: Joi.number().integer().min(1),
        name: Joi.string(),
    }).xor("id", "name"),
};

const retrieveMessages = {
    body: Joi.object({
        queueUrl : Joi.string().required(),
        time : Joi.number().required(),
    })
}

module.exports = {
    addQueue,
    updateQueue,
    getQueues,
    deleteQueue,
    retrieveMessages
};
