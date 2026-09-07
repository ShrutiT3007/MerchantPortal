const _ = require("lodash");

const logger = require("../utils/logger");
const constants = require("../../constants");

const validator = (schema) => {
    return (req, res, next) => {
        logger.info(schema);

        let message = "";
        for (const [key, joiSchema] of Object.entries(schema)) {
            logger.info(req[key]);
    
            const { error, value } = joiSchema.validate(req[key], {
                abortEarly: false,
                convert: true,
            });
            if (error) {
                message += error.details[0].message + "\n";
            }
            if (key === "query") {
                Object.defineProperty(req, key, {
                    value,
                    writable: true,
                });
            }
        }

        if (message) {
            const error = new Error(message);
            error.errorCode = constants.ERROR_RESPONSE.INVALID_PARAMS.errorCode;
            next(error);
        } else {
            next();
        }
    };
};

module.exports = validator;
