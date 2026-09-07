const { Op, fn, where, col } = require("sequelize");

const logger = require("../utils/logger");
const RoleModel = require("../database/MP/models/casbinRole");

const getRolesMappings = async ({ pageNumber, limit, ...query }) => {
    logger.info();

    const attributes = { exclude: ["v3", "v4", "v5"] };
    const filter = { ptype: "p" };

    if (query.role) {
        filter["v0"] = { [Op.like]: `${query.role}%` };
    } else if (query.resource) {
        filter["v1"] = { [Op.like]: `${query.resource}%` };
    } else if (query.accessType) {
        filter["v2"] = query.accessType;
    }

    const options = { offset: (query.pageNumber - 1) * query.limit, limit: query.limit };

    return RoleModel.getRoles({ attributes, filter, options });
};

const getApiRoleAndResource = async (query) => {
    logger.info();

    const options = {};
    if (query.pageNumber && query.limit) {
        options.offset = (query.pageNumber - 1) * query.limit;
        options.limit = query.limit;
    }

    const filter = {};
    const attributes = { exclude: ["v2", "v3", "v4", "v5"] };

    if (query.apiName) {
        filter["ptype"] = "g2";
        filter["v0"] = { [Op.like]: `${query.apiName}%` };
    } else if (query.resource) {
        filter["ptype"] = { [Op.in]: ["g2", "g3", "p"] };
        filter[Op.or] = [
            { v1: { [Op.like]: `${query.resource}%` } },
            where(fn("BINARY", col("v0")), {
                [Op.like]: `${query.resource}%`,
            }),
        ];
    } else if (query.role) {
        filter["ptype"] = { [Op.in]: ["g", "p"] };
        filter[Op.or] = [
            { v0: { [Op.like]: `${query.role}%` } },
            where(fn("BINARY", col("v1")), {
                [Op.like]: `${query.role}%`,
            }),
        ];
    } else {
        if (query.key === "roles") {
            filter["ptype"] = { [Op.in]: ["g", "p"] };
        } else if (query.key === "apis") {
            filter["ptype"] = "g2";
        } else {
            filter["ptype"] = { [Op.in]: ["g2", "g3", "p"] };
        }
    }
    return RoleModel.getApiAndResources({ attributes, filter, options });
};

const getMainResourceForRole = async (role) => {
    logger.info();

    return RoleModel.getMainResourceForRole(role);
};

module.exports = { getRolesMappings, getApiRoleAndResource, getMainResourceForRole };
