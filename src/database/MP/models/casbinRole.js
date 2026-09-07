const logger = require("../../../utils/logger");
const db = require("../db");

let role;

const getInstance = () => {
    if (role) return role;
    role = db.getTable("casbinRole");
    return role;
};

const getRoles = async ({ filter, attributes, options }) => {
    logger.info(filter, attributes, options);

    return getInstance().findAll({ attributes, where: filter, options });
};

const getApiAndResources = async ({ filter = {}, attributes = {}, options = {} }) => {
    logger.info(filter, attributes, options);

    return getInstance().findAll({ attributes, where: filter, options });
};

const getMainResourceForRole = async (role) => {
    logger.info(role);

    const DBInstance = db.getDb();

    const results = await DBInstance.query(
        `
        WITH RECURSIVE role_inheritance AS (
        -- Start from the given role
        SELECT :role AS role

        UNION

        -- Recursively get inherited roles via 'g'
        SELECT cr.v1
        FROM casbin_rule cr
        INNER JOIN role_inheritance ri ON cr.v0 = ri.role
        WHERE cr.ptype = 'g'
        ),
        resource_hierarchy AS (
        -- Get initial resources accessible by inherited roles via 'p'
        SELECT v1 AS resource
        FROM casbin_rule
        WHERE ptype = 'p' AND v0 IN (SELECT role FROM role_inheritance)

        UNION ALL

        -- Climb the resource hierarchy using 'g3'
        SELECT cr.v1
        FROM casbin_rule cr
        INNER JOIN resource_hierarchy rh ON cr.v0 = rh.resource
        WHERE cr.ptype = 'g3'
        )


        -- Final: select only the top-most resources (i.e., those not children of anything else)
        SELECT DISTINCT rh.resource AS main_resource
        FROM resource_hierarchy rh
        LEFT JOIN casbin_rule cr ON cr.ptype = 'g3' AND cr.v0 = rh.resource
        WHERE cr.v0 IS NULL;

  `,
        {
            replacements: { role },
            type: DBInstance.QueryTypes.SELECT,
        }
    );

    return results ? results.map((obj) => obj.main_resource) : null;
};

module.exports = { getRoles, getApiAndResources, getMainResourceForRole };
