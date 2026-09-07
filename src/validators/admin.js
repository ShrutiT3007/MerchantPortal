const Joi = require("joi");
const constants = require("../../constants");
const { toUpper } = require("lodash");

const addApisToResource = {
    body: Joi.object({
        apiName: Joi.string().trim().required(),
        resource: Joi.string().trim().required(),
    }),
};

const addResourceHierarchy = {
    body: Joi.object({
        childResource: Joi.string().trim().required().min(1),
        parentResource: Joi.string().trim().required().min(1),
    }),
};

const addRoleHierarchy = {
    body: Joi.object({
        childRole: Joi.string().trim().required().min(1),
        parentRole: Joi.string().trim().required().min(1),
    }),
};

const mapRoleWithResource = {
    body: Joi.object({
        role: Joi.string().trim().required(),
        resource: Joi.string().required(),
        accessType: Joi.string()
            .valid(...Object.values(constants.ACCESS_TYPE))
            .required(),
    }),
};

const getUsers = {
    query: Joi.object({
        pageNumber: Joi.number().integer().min(1).required(),
        limit: Joi.number().integer().min(1).required(),
        status: Joi.string()
            .valid(...Object.values(constants.USER.STATUS))
            .optional(),
        email: Joi.string().trim().optional(),
    }),
};

const updateUser = {
    body: Joi.object({
        email: Joi.string().email().required(),
        status: Joi.string()
            .valid(...Object.values(constants.USER.STATUS))
            .optional(),
        currentStatus: Joi.string()
            .valid(...Object.values(constants.USER.STATUS))
            .required(),
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

const addUserRole = {
    body: Joi.object({
        userId: Joi.number().integer().min(1).required(),
        roleName: Joi.string().required(),
    }),
};

const getApiRoleAndResource = {
    query: Joi.object({
        pageNumber: Joi.number().integer().min(1).required(),
        limit: Joi.number().integer().min(1).required(),

        resource: Joi.string(),
        apiName: Joi.string(),
        role: Joi.string(),

        key: Joi.string()
            .valid("roles", "apis", "resource")
            .when(
                Joi.object({
                    resource: Joi.exist(),
                    apiName: Joi.exist(),
                    role: Joi.exist(),
                }).or("resource", "apiName", "role"),
                {
                    then: Joi.forbidden(),
                    otherwise: Joi.required(),
                }
            ),
    }),
};

const getRolesMappings = {
    query: Joi.object({
        pageNumber: Joi.number().integer().min(1).required(),
        limit: Joi.number().integer().min(1).required(),
        role: Joi.string().optional(),
        resource: Joi.string().optional(),
        accessType: Joi.string()
            .valid(...Object.values(constants.ACCESS_TYPE))
            .optional(),
    }),
};

const updatePolicy = {
    body: Joi.object({
        ptype: Joi.string()
            .valid(...Object.values(constants.PTYPE))
            .required(),
        oldPolicy: Joi.array().required(),
        newPolicy: Joi.array().required(),
    }).custom((value, helpers) => {
        const { ptype, oldPolicy, newPolicy } = value;

        if (ptype === constants.PTYPE.P) {
            if (oldPolicy.length !== 3) {
                return helpers.message('oldPolicy must have 3 elements when ptype is "p"');
            }

            if (!constants.ACCESS_TYPE[toUpper(oldPolicy[2])]) {
                return helpers.message("oldPolicy[2] must be one of read, write, delete");
            }

            if (newPolicy.length !== 3) {
                return helpers.message('newPolicy must have 3 elements when ptype is "p"');
            }

            if (!constants.ACCESS_TYPE[toUpper(newPolicy[2])]) {
                return helpers.message("newPolicy[2] must be one of read, write, delete");
            }
        } else {
            if (oldPolicy.length !== 2 || newPolicy.length !== 2) {
                return helpers.message('newPolicy and oldPolicy must have 2 elements when ptype is not "p"');
            }
        }

        return value;
    }, "Custom validation for ptype"),
};

const deletePolicy = {
    body: Joi.object({
        ptype: Joi.string()
            .valid(...Object.values(constants.PTYPE))
            .required(),
        policy: Joi.array().required(),
    }).custom((value, helpers) => {
        const { ptype, policy } = value;

        if (ptype === constants.PTYPE.P) {
            if (policy.length !== 3) {
                return helpers.message('policy must have 3 elements when ptype is "p"');
            }

            if (!constants.ACCESS_TYPE[toUpper(policy[2])]) {
                return helpers.message("policy[2] must be one of read, write, delete");
            }
        } else if (policy.length !== 2) {
            return helpers.message('policy must have 2 elements when ptype is not "p"');
        }

        return value;
    }, "Custom validation for policy by ptype"),
};

const addDbConfig = {
    body: Joi.object({
        id : Joi.number().integer().min(1),
        name: Joi.string().required(),
        data: Joi.object().required(),
    }),
};

const addOrUpdateFunction = {
    body: Joi.object({
        name: Joi.string().required(),
        functionString: Joi.string().required(),
    }),
}
const addService = {
    body: Joi.object({
        serviceName:Joi.string().required(),
        serverName:Joi.string().required(),
        ip: Joi.string().required(),
        chatUrl: Joi.string().required()
    })
};

const deleteService = {
    body: Joi.object({
        serverName: Joi.string(),
        ip: Joi.string()
    }).xor('serverName', 'ip') 
};

const executeQuery = {
    body: Joi.object({
        dbName: Joi.string().required(),
        query: Joi.string().required(),
    })
};

const sendMail ={
    body: Joi.object({
        subscribers: Joi.array().items(Joi.string().email()).min(1).optional(),
        toAll:Joi.boolean().optional()
    })
};

module.exports = {
    addApisToResource,
    addResourceHierarchy,
    addRoleHierarchy,
    mapRoleWithResource,
    getUsers,
    updateUser,
    getApiRoleAndResource,
    getRolesMappings,
    updatePolicy,
    deletePolicy,
    addUserRole,
    addDbConfig,
    addService,
    executeQuery,
    deleteService,
    executeQuery,
    sendMail
};
