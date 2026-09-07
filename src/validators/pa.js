const Joi = require("joi");

const { ENVIRONMENT } = require("../../constants");

const createTransaction = {
    body: Joi.object({
        merchantId: Joi.string().required(),
        environment: Joi.string().valid(ENVIRONMENT.QA, ENVIRONMENT.STAGING).required(),
        amount: Joi.number().required().min(1),
    }),
};

const createTransactions = {
  body: Joi.object({
    type: Joi.string().required(),
    data: Joi.object().required(),
  }),
};

module.exports = { createTransactions,createTransaction };