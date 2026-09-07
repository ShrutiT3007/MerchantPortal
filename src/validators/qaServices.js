const Joi = require("joi");

const trigger = {
    body: Joi.object({
        serviceName: Joi.string().trim().min(1).required(),
    }),
};

module.exports = { trigger };
