const Joi = require("joi");
const constants = require("../../constants");

const getStatusCount = {
    query: Joi.object({
        from: Joi.date().required().max(Joi.ref("to")).messages({
            "date.max": `"from" must be less than or equal to "to"`,
        }),
        to: Joi.date().required(),
        rangeKey: Joi.string().valid("created_at", "updated_at").optional(),
    }),
};

const getLeads = {
    query: Joi.object({
        from: Joi.date().max(Joi.ref("to")).optional().messages({
            "date.max": `"from" must be less than or equal to "to"`,
        }),

        to: Joi.date().optional(),

        pageNumber: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).optional(),

        sortBy: Joi.string().valid("created_at", "updated_at").required(),
        order: Joi.string().valid("ASC", "DESC").required(),
        status: Joi.string().required(),

        rangeKey: Joi.string().valid("created_at", "updated_at").optional(),
        download: Joi.string().valid("true").optional(),
    }).custom((value, helpers) => {
        const hasFrom = !!value.from;
        const hasTo = !!value.to;
        const hasRangeKey = !!value.rangeKey;

        if ((hasFrom || hasTo) && !hasRangeKey) {
            return helpers.message(`'rangeKey' is required when 'from' or 'to' is present`);
        }

        if (!hasFrom && !hasTo && hasRangeKey) {
            return helpers.message(`'rangeKey' must not be provided without 'from' or 'to'`);
        }

        return value;
    }, "Custom rangeKey logic"),
};

const pushNotification = {
    body: Joi.object({
        environment: Joi.string().valid(constants.ENVIRONMENT.STAGING, constants.ENVIRONMENT.QA).required(),
        type: Joi.string()
            .valid(...Object.keys(constants.MOB_NOTIFICATIONS))
            .required(),
        data: Joi.alternatives().conditional("type", {
            switch: [
                {
                    is: "ONBOARDING_STATUS",
                    then: Joi.object({
                        sequence: Joi.number().required(),
                        partnerId: Joi.string().required(),
                        referenceId: Joi.string().required(),
                        intentId: Joi.string().required(),
                        statusCode: Joi.string().required(),
                        statusMessage: Joi.string().required(),
                        entityCode: Joi.string().required(),
                        perTransactionLimit: Joi.number().required(),
                        dailyTransactionLimit: Joi.number().required(),
                        monthlyTransactionLimit: Joi.number().required(),
                    }),
                },
                {
                    is: "CAF_GENERATION",
                    then: Joi.object({
                        sequence: Joi.number().required(),
                        partnerId: Joi.string().required(),
                        referenceId: Joi.string().required(),
                        intentId: Joi.string().required(),
                        statusCode: Joi.string().required(),
                        statusMessage: Joi.string().required(),
                        preSignedUrl: Joi.string().allow("").required(),
                    }),
                },
                {
                    is: "CAF_CONSENT",
                    then: Joi.object({
                        sequence: Joi.number().required(),
                        partnerId: Joi.string().required(),
                        referenceId: Joi.string().required(),
                        intentId: Joi.string().required(),
                        statusCode: Joi.string().required(),
                        statusMessage: Joi.string().required(),
                        remarks: Joi.string().required(),
                    }),
                },
                {
                    is: "CHECKER_REJECTION",
                    then: Joi.object({
                        sequence: Joi.number().required(),
                        partnerId: Joi.string().required(),
                        referenceId: Joi.string().required(),
                        intentId: Joi.string().required(),
                        statusCode: Joi.string().required(),
                        statusMessage: Joi.string().required(),
                        remarks: Joi.string().required(),
                        fields: Joi.array()
                            .items(
                                Joi.object({
                                    key: Joi.string().required(),
                                    remarks: Joi.string().required(),
                                })
                            )
                            .required(),
                    }),
                },
            ],
            otherwise: Joi.forbidden(), // reject if type doesn't match
        }),
    }),
};

module.exports = { getLeads, getStatusCount, pushNotification };
