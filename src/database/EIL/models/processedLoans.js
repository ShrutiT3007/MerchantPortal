const logger = require("../../../utils/logger");
const db = require("../db");

const getProcessedActiveMerchants = async (startDate) => {
    if (!startDate) throw new Error("Start date is required");

    const query = `
        SELECT t1.merchant_id
FROM loan_application_details t1
INNER JOIN loan_account_details t2
    ON t1.journey_id = t2.journey_id
WHERE t1.status = 'PROCESSED'
  AND t2.status = 'ACTIVE'
  AND t1.created_at >= :startDate;
    `;

    const startDateUTC = new Date(startDate);
    const results = await db.getDb().query(query, { replacements: { startDate: startDateUTC }, type: "SELECT" });
    return results;
};

module.exports = { getProcessedActiveMerchants };