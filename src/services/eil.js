const { stringify } = require("csv-stringify/sync");
const { CronJob } = require("cron");
const moment = require("moment");
const stream = require("stream");

const logger = require("../utils/logger");
const loanApplicationDetailsModel = require("../database/EIL/models/loanApplicationDetails");
const sesModel = require("../database/EIL/models/loanAccountDetails");
const subscribersService = require("./subscribers");
const aws = require("../utils/aws");
const mailUtil = require("../utils/mail");
const lockService = require("./locks");
const constants = require("../../constants");
const { getProcessedActiveMerchants } = require("../database/EIL/models/processedLoans");
const { getMigratedMerchants } = require("../database/MOB/models/processedLoans");
const downloadHistoryService = require("./downloadHistory");

const getApplications = async ({ limit, pageNumber, applicationId }) => {
    logger.info();
    const filter = {};
    const options = {};

    if (applicationId) {
        filter.application_id = applicationId;
    } else {
        options.offset = (pageNumber - 1) * limit;
        options.limit = limit;
    }

    return loanApplicationDetailsModel.getEntries({ options, filter });
};

function toInteger(value) {
    if (value == null || value === "") return 0;

    if (typeof value === "string") {
        const num = Number(value);
        if (isNaN(num)) return value;
        return Math.trunc(num);
    }

    if (typeof value === "number") {
        return Math.trunc(value);
    }

    return value;
}

const getData = async ({ filter = {} }) => {
    logger.info();

    const data = await sesModel.getMailData({ filter });
    const isCurrentDate = moment(filter.to).isSame(filter.from, "day");
    const taskSummaryHeaders = ["Active loans count between selected Date", "Active loans count of last selected Month", "Loan disbursed between selected date"];
    const taskSummary = data.slice(0, 3).map((entry, index) => {
        const obj = {};
        Object.entries(entry).forEach(([key, value]) => {
            obj.Fields = key;
            obj.Values = value ? toInteger(value) : 0;
        });
        return obj;
    });

    const csvFile1Data = data.slice(2, 6);
    const csvFile2Data = data.slice(6);
    const data1Headers = ["till selected date", "till last selected month", "last selected week", "last previous day"];

    const data1 = csvFile1Data.map((entry, index) => {
        const obj = {};
        Object.entries(entry).forEach(([key, value]) => {
            obj["Time Duration"] = index === 0 ? "till date" : key;
            obj.Fields = "Loan disbursed";
            obj.Values = value ? toInteger(value) : 0;
        });
        return obj;
    });

    const data2 = csvFile2Data.map((entry) => {
        const obj = {};
        Object.entries(entry).forEach(([key, value], index) => {
            if (index === 0) {
                const stringValues = key.split(" ");
                obj.Round = stringValues[0];
                obj["Task status"] = stringValues[1];
                obj["Task type"] = stringValues[2];
                obj.Count = value;
            } else {
                obj.Date = value;
            }
        });
        return obj;
    });

    return { taskStatus: data1, loansDisbursed: data2, taskSummary };
};

const createCsvFile = async () => {
    logger.info();

    const filter = {};
    filter.from = moment("2023-10-10 00:00:00").toDate();
    filter.to = moment().toDate();
    filter.disbursedStatusTo = moment(filter.to).subtract(1, "day").endOf("day").toDate();
    filter.disbursedStatusFrom = moment(filter.to).subtract(1, "day").startOf("day").toDate();

    const { taskStatus, loansDisbursed, taskSummary } = await getData({ filter });

    const headers1 = ["Fields", "Time Duration", "Values"];
    const headers2 = ["Round", "Task status", "Task type", "Count", "Date"];
    const attachment = {};
    attachment.Loans_Disbursed = stringify(taskStatus, { header: true, columns: headers1 });
    attachment.Task_Status = stringify(loansDisbursed, { header: true, columns: headers2 });

    return { attachment, taskSummary };
};

const getSummaryData = async ({ filter = {} }) => {
    logger.info();

    if (!filter.from) filter.from = moment("2023-10-10 00:00:00").toDate();
    if (!filter.to) filter.to = moment().toDate();
    if (!filter.disbursedStatusTo) filter.disbursedStatusTo = filter.to;
    if (!filter.disbursedStatusFrom) filter.disbursedStatusFrom = filter.from;

    const isCurrentDate = moment().isSame(filter.to, "day");
    const isSameStartingDate = moment(constants.EIL_STARTING_DATE).isSame(filter.from);
  
    const getHeaders = () => {
        const from = moment(filter.from);
        const to = moment(filter.to);
        const headers = [];
        if (isCurrentDate && isSameStartingDate) return headers;
        else if (isCurrentDate && !isSameStartingDate) {
            headers.push(`Till Date(from ${from.format("DD MMM YYYY")})`);
        } else if (isSameStartingDate) {
            headers.push(`Till ${to.format("DD MMM YYYY")}`);
        } else {
            headers.push(`In selected range (from ${from.format("DD MMM YYYY")} to ${to.format("DD MMM YYYY")})`);
        }
        if (to.month() === moment().month() && to.year() === moment().year()) {
            if (from.month() === to.month() && from.year() === to.year()) {
                headers.push(`Current month (from ${from.format("DD")}th to ${to.format("DD")}th)`);
            }
            headers.push(`Current month (till ${to.format("DD")}th)`);
        } else if (!from.isSame(to, "month") && from.isSame(to, "year")) {
            headers.push(`In month of ${to.format("MMM YYYY")} (till ${to.format("DD")}th)`);
        } else {
            headers.push(`In month of ${to.format("MMM YYYY")} (from ${from.clone().startOf("month").format("DD")}th to ${to.format("DD")}th)`);
        }

        const weekStart = moment.max(to.clone().startOf("isoWeek"), from).format("DD");
        headers.push(`In week of ${to.format("MMM YYYY")} (from ${weekStart}th to ${to.format("DD")}th)`);
        if (from.isSame(to, "day")) {
            headers.push(`On ${to.clone().subtract(1, "day").format("DD MMM YYYY")} (out of range) `);
        } else {
            if (isCurrentDate) headers.push(`Yesterday`);
            else headers.push(`On ${to.clone().subtract(1, "day").format("DD MMM YYYY")}`);
        }
        if (isCurrentDate) headers.push(`Today`);
        else headers.push(`On ${to.format("DD MMM YYYY")}`);
        return headers;
    };
   
    if (filter.key === "loanData") {
        const [loanAmountData, loanCountData] = await Promise.all([sesModel.getLoanAmountSummary({ filter }), sesModel.getLoanCountSummary({ filter })]);
        const data = {};
        const headers  = getHeaders();
        for (let i = 0; i < loanAmountData.length; i++) {
            const key = Object.keys(loanAmountData[i])[0];
            const header = headers[i] || key;
            data[header] = {};
            data[header].amount = toInteger(loanAmountData[i][key]);
            data[header].count = toInteger(loanCountData[i][key]);
        }
        return data;
    }
    const taskExecutionData = await sesModel.getTaskSummary({ filter });
    const data2 = taskExecutionData.map((entry , i) => {
        const obj = {};
        Object.entries(entry).forEach(([key, value], index) => {
            if (index === 0) {
                const stringValues = key.split(" ");
                obj.Round = stringValues[0];
                obj["Task status"] = stringValues[1];
                obj["Task type"] = stringValues[2];
                obj.Count = value;
            } else {
                if (!moment(filter.to).isSame(filter.from, "day") && i!==6) {
                    obj.Date =
                        `${moment(filter.disbursedStatusFrom).date()} ${moment(filter.disbursedStatusFrom).format("MMMM").toUpperCase()} ${moment(filter.disbursedStatusFrom).year()}` + " to " + value;
                } else {
                     obj.Date = value;
                }
            }
        });
        return obj;
    });
    return data2;
};

const subscribe = async (details) => {
    logger.info();

    details.serviceName = constants.SERVICES.EIL;
    return subscribersService.addSubscriber(details);
};

const unSubscribe = async (details) => {
    logger.info();

    details.serviceName = constants.SERVICES.EIL;
    return subscribersService.deleteSubscriber(details);
};

const isSubscribed = async () => {
    logger.info();

    return subscribersService.isSubscribed();
};

const sendMail = async (subscribers = [], toAll = true) => {
    logger.info("starting news letter cron");

    let isLockAcquired = false;
    try {
        await lockService.applylock(100);
        isLockAcquired = true;
        logger.info("news letter cron running");
        const data = await createCsvFile();
        logger.info("csv for uploading is ready");
        let recipient = subscribers;
        if(toAll){
            recipient =[ ...recipient,...await subscribersService.getSubscribers((filter = { serviceName: "EIL" }))];
        }
        logger.info("subscribers fetched ");
        await aws.sendMail(mailUtil.createEmailBody({ data, recipient }));
        logger.info("mail sent");
    } catch (err) {
        if (err.name !== "SequelizeUniqueConstraintError"){
        logger.error("error in sending mail", err);
        }
    } finally {
        if (isLockAcquired) {
            setTimeout(async () => {
                await lockService.releaseLock({ id: 100 });
                logger.info(`lock released for news letter`);
            }, 30000);
        }
    }
};

const newsLetterJob = new CronJob("0 10 * * *", sendMail, null, true, "Asia/Kolkata");

const getNonMigratedMerchants = async (startDate) => {
    if (!startDate) {
        throw new Error("Start date is required");
    }
    const processedMerchants = await getProcessedActiveMerchants(startDate);
    if (!processedMerchants.length) {
        return [];
    }
    const midList = processedMerchants.map((m) => m.merchant_id);
    const nonMigratedRows = await getMigratedMerchants(midList);

    return nonMigratedRows;
};

const downloadNonMigratedMerchants = async (startDate, userId) => {
    if (!startDate) throw new Error("Start date is required");
    logger.info("Starting download of Non-Migrated Merchants");

    const downloadEntry = await downloadHistoryService.createEntry();
    const downloadId = downloadEntry.id;
    const s3FileName = `Non-Migrated Merchants-${moment(startDate).format("YYYY-MM-DD")}-${moment().format("YYYY-MM-DD")}.csv`;
    const s3Key = aws.createS3Key(s3FileName);
    const uploadStream = new stream.PassThrough();
    const s3UploadPromise = aws.uploadToS3({ s3Key, data: uploadStream });

    const headers = ["Merchant ID", "Status"];
    let isFirstRow = true;
    let buffer = [];

    try {
        const rows = await getNonMigratedMerchants(startDate);
        const nonMigratedRows = rows.map((row) => ({
            "Merchant ID": row.merchant_id,
            Status: row.status,
        }));

        logger.info({ userId, count: nonMigratedRows.length }, "Fetched non-migrated merchants");

        if (!nonMigratedRows.length) {
            await downloadHistoryService.updateEntry({
                data: { s3Key: null, downloadKey: null, status: constants.DOWNLOAD_HISTORY_STATUS.COMPLETED },
                id: downloadId,
            });
            return [];
        }
        const nonMigratedRowsStream = stream.Readable.from(nonMigratedRows);
        await new Promise((resolve, reject) => {
            nonMigratedRowsStream.on("data", (entry) => {
                buffer.push(entry);
                if (buffer.length >= 1000) {
                    const chunk = stringify(buffer, { header: isFirstRow, columns: headers });
                    isFirstRow = false;

                    if (!uploadStream.write(chunk)) {
                        nonMigratedRowsStream.pause();
                        uploadStream.once("drain", () => nonMigratedRowsStream.resume());
                    }
                    buffer = [];
                }
            });
            nonMigratedRowsStream.on("end", () => {
                if (buffer.length > 0) {
                    const chunk = stringify(buffer, { header: isFirstRow, columns: headers });
                    uploadStream.write(chunk);
                }
                uploadStream.end();
                resolve();
            });
            nonMigratedRowsStream.on("error", (err) => {
                buffer = [];
                uploadStream.destroy(err);
                reject(err);
            });
        });
        await s3UploadPromise;

        logger.info("Non-Migrated Merchants CSV successfully uploaded to S3");

        await downloadHistoryService.updateEntry({
            data: {
                fileName: s3FileName,
                s3Key: encodeURIComponent(s3Key),
                downloadKey: s3Key,
                status: constants.DOWNLOAD_HISTORY_STATUS.COMPLETED,
            },
            id: downloadId,
        });
        return nonMigratedRows;
    } catch (err) {
        logger.error({ userId }, "Error in downloadNonMigratedMerchants function", err);

        await downloadHistoryService.updateEntry({
            data: { status: constants.DOWNLOAD_HISTORY_STATUS.FAILED },
            id: downloadId,
        });

        throw err;
    }
};

module.exports = { getApplications, getData, newsLetterJob, subscribe, createCsvFile, unSubscribe, sendMail, isSubscribed, getNonMigratedMerchants, downloadNonMigratedMerchants, getSummaryData };
