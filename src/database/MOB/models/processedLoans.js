const logger = require("../../../utils/logger");
const db = require("../db");

/**
 * @param {Array<string>} midList
 * @returns {Promise<Array<{ merchant_id: string, status: string }>>}
 */
const getMigratedMerchants = async (midList) => {
  if (!Array.isArray(midList) || midList.length === 0) {
    throw new Error("MID list must be a non-empty array");
  }

  logger.info("Fetching non-migrated merchants for:", midList);

  const query = `
    SELECT m.merchant_id, m.status
    FROM merchant m
    LEFT JOIN merchant_migration mm
      ON m.merchant_id = mm.merchant_id
    WHERE m.merchant_id IN (:midList)
      AND (mm.merchant_id IS NULL OR mm.migration_status != 1)
  `;

  const results = await db.getDb().query(query, {
    replacements: { midList },
    type: "SELECT",
  });

  logger.info("Non-migrated merchants:", results);
  return results;
};

module.exports = { getMigratedMerchants };
