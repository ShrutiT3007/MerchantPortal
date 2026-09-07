const Joi = require("joi");
const constants = require("../../constants");

const updateUser = {
    body: Joi.object({
        email: Joi.string().email().required(),
        mobile: Joi.string().optional(),
        userName: Joi.string().optional(),
        password: Joi.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+$/)
            .optional()
            .messages({
                "string.min": "Password must be at least 8 characters long.",
                "string.pattern.base": "Password must include one uppercase letter, one lowercase letter, and one special character.",
            }),
    }),
};

const getUserDetails = {
    query: Joi.object({
        id: Joi.number().integer().min(1).required(),
    }),
};

module.exports = { getUserDetails, updateUser };
