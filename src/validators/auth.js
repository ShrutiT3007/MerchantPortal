const Joi = require("joi");

const signIn = {
    body: Joi.object({
        email: Joi.string().email().trim().required(),
        password: Joi.string().trim().min(8).required(),
    }),
};

const signUp = {
    body: Joi.object({
        userName: Joi.string().required().min(1),
        email: Joi.string().email().required().min(1),
        password: Joi.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+$/)
            .required()
            .messages({
                "string.min": "Password must be at least 8 characters long.",
                "string.pattern.base": "Password must include one uppercase letter, one lowercase letter, and one special character.",
            }),
        mobile: Joi.string()
            .pattern(/^[0-9]{10}$/)
            .required()
            .messages({
                "string.pattern.base": "Mobile must be a 10-digit number.",
            }),
    }),
};

const sendEmailVerficationOtp = {
    body: Joi.object({
        email: Joi.string().email().required().min(1),
    }),
};

const verifyEmail = {
    body: Joi.object({
        otp: Joi.string()
            .pattern(/^\d{6}$/)
            .required(),
        userId: Joi.number().required(),
    }),
};

module.exports = {
    signIn,
    signUp,
    sendEmailVerficationOtp,
    verifyEmail,
};
