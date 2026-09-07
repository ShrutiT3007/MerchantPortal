const db = require("../db");
const logger = require("../../../utils/logger");

const getMailData = async ({ attributes = {}, filter = {}, options = {} }) => {
    logger.info(attributes, options, filter);

    const results = await db.getDb().query(
        `
    SELECT COUNT(*) AS "Active loans count till Date" FROM loan_application_details t1 INNER JOIN loan_account_details t2 ON t1.journey_id = t2.journey_id WHERE t1.status = 'PROCESSED' AND t2.status = 'ACTIVE' AND t1.created_at >= :from AND t1.updated_at <= :to;
    SELECT COUNT(*) AS "Active loans count current Month" FROM loan_application_details t1 INNER JOIN loan_account_details t2 ON t1.journey_id = t2.journey_id WHERE t1.status = 'PROCESSED' AND t2.status = 'ACTIVE' AND YEAR(t1.updated_at) = YEAR(:to) AND MONTH(t1.updated_at) = MONTH(:to) AND t1.updated_at >= :from;
    SELECT SUM(loan_amount) AS "Loan disbursed till date" FROM loan_application_details t1 INNER JOIN loan_account_details t2 ON t1.journey_id = t2.journey_id WHERE t1.status = 'PROCESSED' AND t2.status = 'ACTIVE' AND t1.updated_at >= :from AND t1.updated_at <= :to;
    SELECT SUM(loan_amount) AS "current month" FROM loan_application_details t1 INNER JOIN loan_account_details t2 ON t1.journey_id = t2.journey_id WHERE t1.status = 'PROCESSED' AND t2.status = 'ACTIVE' AND YEAR(t1.updated_at) = YEAR(:to) AND MONTH(t1.updated_at) = MONTH(:to ) AND t1.updated_at >= :from;
    SELECT SUM(loan_amount) AS "current week" FROM loan_application_details t1 INNER JOIN loan_account_details t2 ON t1.journey_id = t2.journey_id WHERE t1.status = 'PROCESSED' AND t2.status = 'ACTIVE' AND YEARWEEK(t1.updated_at, 1) = YEARWEEK(:to, 1);
    SELECT SUM(loan_amount) AS "previous day" FROM loan_application_details t1 INNER JOIN loan_account_details t2 ON t1.journey_id = t2.journey_id WHERE t1.status = 'PROCESSED' AND t2.status = 'ACTIVE' AND Date(t1.updated_at) = DATE(:to - INTERVAL 1 DAY);
    SELECT COUNT(*) AS "R1 Success disbursement tasks count", CONCAT(DAY(:disbursedStatusTo), ' ', UPPER(DATE_FORMAT(:disbursedStatusTo, '%M')), ' ', YEAR(:disbursedStatusTo)) AS date_of_execution FROM task_execution WHERE task_id LIKE '%R1'  AND created_time >= :disbursedStatusFrom AND created_time <= :disbursedStatusTo AND completion_status = 'SUCCESS';
    SELECT COUNT(*) AS "R1 Retry disbursement tasks count", CONCAT(DAY(:disbursedStatusTo), ' ', UPPER(DATE_FORMAT(:disbursedStatusTo, '%M')), ' ', YEAR(:disbursedStatusTo)) AS date_of_execution FROM task_execution WHERE task_id LIKE '%R1' AND created_time >= :disbursedStatusFrom AND created_time <= :disbursedStatusTo AND completion_status = 'RETRY';
    SELECT COUNT(*) AS "R1 Failed disbursement tasks count", CONCAT(DAY(:disbursedStatusTo), ' ', UPPER(DATE_FORMAT(:disbursedStatusTo, '%M')), ' ', YEAR(:disbursedStatusTo)) AS date_of_execution FROM task_execution WHERE task_id LIKE '%R1' AND created_time >= :disbursedStatusFrom AND created_time <= :disbursedStatusTo AND completion_status = 'FAILED';
    SELECT COUNT(*) AS "R2 Success disbursement tasks count", CONCAT(DAY(:disbursedStatusTo), ' ', UPPER(DATE_FORMAT(:disbursedStatusTo, '%M')), ' ', YEAR(:disbursedStatusTo)) AS date_of_execution FROM task_execution WHERE task_id LIKE '%R2'  AND created_time >= :disbursedStatusFrom AND created_time <= :disbursedStatusTo AND completion_status = 'SUCCESS';
    SELECT COUNT(*) AS "R2 Retry disbursement tasks count", CONCAT(DAY(:disbursedStatusTo), ' ', UPPER(DATE_FORMAT(:disbursedStatusTo, '%M')), ' ', YEAR(:disbursedStatusTo)) AS date_of_execution FROM task_execution WHERE task_id LIKE '%R2'  AND created_time >= :disbursedStatusFrom AND created_time <= :disbursedStatusTo AND completion_status = 'RETRY';
    SELECT COUNT(*) AS "R2 Failed disbursement tasks count", CONCAT(DAY(:disbursedStatusTo), ' ', UPPER(DATE_FORMAT(:disbursedStatusTo, '%M')), ' ', YEAR(:disbursedStatusTo)) AS date_of_execution FROM task_execution WHERE task_id LIKE '%R2'  AND created_time >= :disbursedStatusFrom AND created_time <= :disbursedStatusTo  AND completion_status = 'FAILED';
    `,
        {
            replacements: filter,
            type: db.getDb().QueryTypes.SELECT,
        }
    );

    return results.map((entry) => {
        return entry[0];
    });
};

const getLoanAmountSummary = async ({ attributes = {}, filter = {}, options = {} }) => {
    logger.info(attributes, options, filter);

    const results = await db.getDb().query(
        `
    SELECT SUM(loan_amount) AS "Till date" FROM loan_application_details t1 INNER JOIN loan_account_details t2 ON t1.journey_id = t2.journey_id WHERE t1.status = 'PROCESSED' AND t2.status = 'ACTIVE' AND t1.updated_at >= :from AND t1.updated_at <= :to;
    SELECT SUM(loan_amount) AS "Current month" FROM loan_application_details t1 INNER JOIN loan_account_details t2 ON t1.journey_id = t2.journey_id WHERE t1.status = 'PROCESSED' AND t2.status = 'ACTIVE' AND YEAR(t1.updated_at) = YEAR(:to) AND MONTH(t1.updated_at) = MONTH(:to) AND t1.updated_at >= :from AND t1.updated_at <= :to;
    SELECT SUM(loan_amount) AS "Current week" FROM loan_application_details t1 INNER JOIN loan_account_details t2 ON t1.journey_id = t2.journey_id WHERE t1.status = 'PROCESSED' AND t2.status = 'ACTIVE' AND YEARWEEK(t1.updated_at, 1) = YEARWEEK(:to, 1) AND t1.updated_at >= :from AND t1.updated_at <= :to;
    SELECT SUM(loan_amount) AS "Previous day" FROM loan_application_details t1 INNER JOIN loan_account_details t2 ON t1.journey_id = t2.journey_id WHERE t1.status = 'PROCESSED' AND t2.status = 'ACTIVE' AND Date(t1.updated_at) = DATE(:to - INTERVAL 1 DAY) AND t1.updated_at <= :to AND t1.updated_at >= :from;
    SELECT SUM(loan_amount) AS "Today" FROM loan_application_details t1 INNER JOIN loan_account_details t2 ON t1.journey_id = t2.journey_id WHERE t1.status = 'PROCESSED' AND t2.status = 'ACTIVE' AND Date(t1.updated_at) = DATE(:to) AND t1.updated_at <= :to AND t1.updated_at >= :from;
    `,
        {
            replacements: filter,
            type: db.getDb().QueryTypes.SELECT,
        }
    );

    return results.map((entry) => {
        return entry[0];
    });
};
const getLoanCountSummary = async ({ attributes = {}, filter = {}, options = {} }) => {
    logger.info(attributes, options, filter);

    const results = await db.getDb().query(
        `
    SELECT COUNT(*) AS "Till date" FROM loan_application_details t1 INNER JOIN loan_account_details t2 ON t1.journey_id = t2.journey_id WHERE t1.status = 'PROCESSED' AND t2.status = 'ACTIVE' AND t1.created_at >= :from AND t1.updated_at <= :to;
    SELECT COUNT(*) AS "Current month" FROM loan_application_details t1 INNER JOIN loan_account_details t2 ON t1.journey_id = t2.journey_id WHERE t1.status = 'PROCESSED' AND t2.status = 'ACTIVE' AND YEAR(t1.updated_at) = YEAR(:to) AND MONTH(t1.updated_at) = MONTH(:to) AND t1.updated_at >= :from AND t1.updated_at <= :to;
    SELECT COUNT(*) AS "Current week" FROM loan_application_details t1 INNER JOIN loan_account_details t2 ON t1.journey_id = t2.journey_id WHERE t1.status = 'PROCESSED' AND t2.status = 'ACTIVE' AND YEARWEEK(t1.updated_at, 1) = YEARWEEK(:to, 1)  AND t1.updated_at >= :from AND t1.updated_at <= :to;
    SELECT COUNT(*) AS "Previous day" FROM loan_application_details t1 INNER JOIN loan_account_details t2 ON t1.journey_id = t2.journey_id WHERE t1.status = 'PROCESSED' AND t2.status = 'ACTIVE' AND Date(t1.updated_at) = DATE(:to - INTERVAL 1 DAY) AND t1.updated_at <= :to AND t1.updated_at >= :from;
    SELECT COUNT(*) AS "Today" FROM loan_application_details t1 INNER JOIN loan_account_details t2 ON t1.journey_id = t2.journey_id WHERE t1.status = 'PROCESSED' AND t2.status = 'ACTIVE' AND Date(t1.updated_at) = DATE(:to) AND t1.updated_at <= :to AND t1.updated_at >= :from;
    `,
        {
            replacements: filter,
            type: db.getDb().QueryTypes.SELECT, 
        }
    );

    return results.map((entry) => {
        return entry[0];
    });
};

const getTaskSummary = async ({ attributes = {}, filter = {}, options = {} }) => {
    logger.info(attributes, options, filter);

    const results = await db.getDb().query(
        `
    SELECT COUNT(*) AS "R1 Success Disbursement tasks count", CONCAT(DAY(:disbursedStatusTo), ' ', UPPER(DATE_FORMAT(:disbursedStatusTo, '%M')), ' ', YEAR(:disbursedStatusTo)) AS date_of_execution FROM task_execution WHERE task_id LIKE '%R1'  AND created_time >= :disbursedStatusFrom AND created_time <= :disbursedStatusTo AND completion_status = 'SUCCESS';
    SELECT COUNT(*) AS "R1 Retry Disbursement tasks count", CONCAT(DAY(:disbursedStatusTo), ' ', UPPER(DATE_FORMAT(:disbursedStatusTo, '%M')), ' ', YEAR(:disbursedStatusTo)) AS date_of_execution FROM task_execution WHERE task_id LIKE '%R1' AND created_time >= :disbursedStatusFrom AND created_time <= :disbursedStatusTo AND completion_status = 'RETRY';
    SELECT COUNT(*) AS "R1 Failed Disbursement tasks count", CONCAT(DAY(:disbursedStatusTo), ' ', UPPER(DATE_FORMAT(:disbursedStatusTo, '%M')), ' ', YEAR(:disbursedStatusTo)) AS date_of_execution FROM task_execution WHERE task_id LIKE '%R1' AND created_time >= :disbursedStatusFrom AND created_time <= :disbursedStatusTo AND completion_status = 'FAILED';
    SELECT COUNT(*) AS "R2 Success Disbursement tasks count", CONCAT(DAY(:disbursedStatusTo), ' ', UPPER(DATE_FORMAT(:disbursedStatusTo, '%M')), ' ', YEAR(:disbursedStatusTo)) AS date_of_execution FROM task_execution WHERE task_id LIKE '%R2'  AND created_time >= :disbursedStatusFrom AND created_time <= :disbursedStatusTo AND completion_status = 'SUCCESS';
    SELECT COUNT(*) AS "R2 Retry Disbursement tasks count", CONCAT(DAY(:disbursedStatusTo), ' ', UPPER(DATE_FORMAT(:disbursedStatusTo, '%M')), ' ', YEAR(:disbursedStatusTo)) AS date_of_execution FROM task_execution WHERE task_id LIKE '%R2'  AND created_time >= :disbursedStatusFrom AND created_time <= :disbursedStatusTo AND completion_status = 'RETRY';
    SELECT COUNT(*) AS "R2 Failed Disbursement tasks count", CONCAT(DAY(:disbursedStatusTo), ' ', UPPER(DATE_FORMAT(:disbursedStatusTo, '%M')), ' ', YEAR(:disbursedStatusTo)) AS date_of_execution FROM task_execution WHERE task_id LIKE '%R2'  AND created_time >= :disbursedStatusFrom AND created_time <= :disbursedStatusTo  AND completion_status = 'FAILED';
    
    `,
        {
            replacements: filter,
            type: db.getDb().QueryTypes.SELECT,
        }
    );

    return results.map((entry) => {
        return entry[0];
    });
};
// SELECT COUNT(*) AS "EI Total Creations", CONCAT(DAY(:disbursedStatusTo), ' ', UPPER(DATE_FORMAT(:disbursedStatusTo, '%M')), ' ', YEAR(:disbursedStatusTo)) AS date_of_execution FROM task WHERE id LIKE 'EICreation.%' AND current_schedule_time >= :disbursedStatusFrom AND current_schedule_time <= :disbursedStatusTo;
module.exports = { getMailData, getLoanAmountSummary, getLoanCountSummary, getTaskSummary };
