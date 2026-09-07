const Joi = require("joi");

const getLoanApplications = {
    query: Joi.object({
        applicationId: Joi.string(),
        pageNumber: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1),
    })
        .xor("applicationId", "pageNumber")
        .with("pageNumber", "limit")
        .with("limit", "pageNumber"),
};

const subscribe = {
    body : Joi.object({
        emailId : Joi.string().email().required()
    })
}
const summary = {
    query : Joi.object({
        to: Joi.date().optional(),
        from: Joi.date().optional(),
        key: Joi.string().valid("loanData" , "taskData").required()
    })
};

const getMigratedMerchants = {
    query: Joi.object({
        startDate: Joi.date().required(),
        download: Joi.string().valid("true").optional(), 
    }),
};

module.exports = { getLoanApplications , subscribe , summary , getMigratedMerchants };
