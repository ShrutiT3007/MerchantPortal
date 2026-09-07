const { Op } = require("sequelize");

const logger = require("../utils/logger");
const sqsModel = require("../database/MP/models/sqs");
const cronService = require("./crons");
const aws = require("../utils/aws");
const downloadHistoryService = require("./downloadHistory");
const constants = require("../../constants");
const { stringify } = require("csv-stringify");

const getQueues = async ({ pageNumber = null, limit = null, updatedAt = null, isActive = null, ...regex }) => {
    logger.info("Fetching queues", regex);

    const options = {};
    if (pageNumber && limit) {
        options.offset = (pageNumber - 1) * limit;
        options.limit = limit;
    }

    const filter = {};
    Object.entries(regex).forEach(([key, value]) => {
        filter[key] = { [Op.like]: `${value}%` };
    });

    if (updatedAt) {
        filter.updatedAt = {
            [Op.gte]: updatedAt,
        };
    }
    if (isActive) {
        filter.isActive = isActive;
    }

    return sqsModel.getQueues({ filter, options });
};

const addQueue = async (details) => {
    logger.info("Adding queue", details);
    const status = await sqsModel.addQueue(details);
};

const updateQueue = async ({ id, ...data }) => {
    logger.info("Updating queue", id, data);

    const filter = { id };
    const status = await sqsModel.updateQueue({ filter, data });

    if (status.length) {
        deleteCron(id);
    }
    return status;
};

const deleteQueue = async ({ id }) => {
    logger.info("Deleting queue", id);

    const status = await sqsModel.deleteQueue({ id });

    if (status) {
        deleteCron(id);
    }

    return status;
};

const deleteCron  = (id)=>{
    logger.info();

    const cronService = require("./crons");
     cronService.deleteCron(id);
}

const downloadMessages = async (filter, id) => {
    logger.info();

    const fileName = "settlementIds.csv";
    const s3Key = aws.createS3Key(fileName);

    try {
        const settlementIds = {};
        const promiseArr = [];

        for (let i = 0; i < filter.time; i++) {
            promiseArr.push(aws.pollMessages(filter.queueUrl));
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
        const sqsResponses = await Promise.allSettled(promiseArr);
        logger.info("sqs response: ",sqsResponses);
        for (const sqsRes of sqsResponses) {
            logger.info("sqsRes: ",sqsRes);
            if (sqsRes.status !== "fulfilled") {
                logger.info(sqsRes);
                continue;
            }
            for (message of sqsRes.value.Messages) {
                const data = JSON.parse(JSON.parse(message.Body).Message).rowData;
                const settlementId = data["Settlement Id"];
                const mid = data["Merchant Id"];
                settlementIds[settlementId] = { settlementId, mid };
            }
        }

        const settlementIdsArray = Object.values(settlementIds);
        const headers = ["settlementId", "mid"];
        const csv = stringify(settlementIdsArray, { header: true, columns: headers });

        await aws.uploadToS3({ s3Key, data: csv });

        logger.info(`file with s3 key ${s3Key} uploaded on s3`);
        const data = {
            fileName: fileName,
            s3Key: encodeURIComponent(s3Key),
            status: constants.DOWNLOAD_HISTORY_STATUS.COMPLETED,
        };
        await downloadHistoryService.updateEntry({ data, id });
    } catch (err) {
        logger.error(err);

        await downloadHistoryService.updateEntry({ id, data: { status: constants.DOWNLOAD_HISTORY_STATUS.FAILED } });
    }
};

module.exports = {
    getQueues,
    addQueue,
    updateQueue,
    deleteQueue,
    downloadMessages,
};
