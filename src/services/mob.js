const moment = require("moment");
const { Op } = require("sequelize");
const stream = require("stream");
const { stringify } = require("csv-stringify/sync");
const aws = require("../utils/aws");

const logger = require("../utils/logger");
const leadsModel = require("../database/MOB/models/leads");
const schema = require("../database/MOB/schema");
const downloadHistoryService = require("./downloadHistory");
const constants = require("../../constants");

const getStatusCount = async ({ to, from, rangeKey }) => {
    logger.info();

    const filter = {
        rangeKey: rangeKey,
        from: moment(from).format("YYYY-MM-DD HH:mm:ss"),
        to: moment(to).format("YYYY-MM-DD HH:mm:ss"),
    };
    return leadsModel.getStatusCount({ filter });
};

const getLeads = async (query) => {
    logger.info();

    return leadsModel.getLeads(createGetLeadsFilter(query));
};

const createGetLeadsFilter = (query) => {
    logger.info();

    const options = {},
        filter = {};
    options.order = [[query.sortBy, query.order]];

    if (query.status) {
        if (query.status === "TOTAL") {
            options.order = [["status", query.order]];
        } else {
            filter.status = query.status;
        }
    }
    if (query.to) {
        filter[query.rangeKey] = {
            [Op.gte]: moment(query.from).format("YYYY-MM-DD HH:mm:ss"),
            [Op.lt]: moment(query.to).format("YYYY-MM-DD HH:mm:ss"),
        };
    }

    return { filter, options };
};

const downloadLeads = async (query, id) => {
    logger.info();

    try {
        const { filter, options } = createGetLeadsFilter(query);
        const dataStream = await leadsModel.getLeadsStream({ filter, options });
        const fileName =
            "MOB" +
            query.status +
            "-" +
            query.rangeKey +
            "-" +
            moment(query.from).format("YYYY-MM-DD") +
            "to" +
            moment(query.to).format("YYYY-MM-DD") +
            "+" +
            options.order[0][0] +
            "+" +
            options.order[0][1]["val"] +
            ".csv";
        const s3Key = aws.createS3Key(fileName);
        const uploadStream = new stream.PassThrough();
        const headers = Object.keys(schema.leads.schema);
        let isFirstRow = true;
        let isUploadedTos3 = false;
        let buffer = [];

        const s3UploadPromise = aws.uploadToS3({ s3Key, data: uploadStream });

        try {
            await new Promise(async (resolve, reject) => {
                dataStream.on("data", async (entry) => {
                    buffer.push(entry);

                    if (buffer.length > 1000) {
                        const chunk = stringify(buffer, { header: isFirstRow, columns: headers });
                        isFirstRow = false;
                        uploadStream.write(chunk);
                        buffer = [];
                    }
                });

                dataStream.on("end", async () => {
                    const chunk = stringify(buffer, { header: isFirstRow, columns: headers });
                    uploadStream.write(chunk);
                    buffer = [];
                    uploadStream.end();
                    resolve();
                });

                dataStream.on("error", async (err) => {
                    buffer = [];
                    uploadStream.destroy(err);
                    reject(err);
                });
            });

            await s3UploadPromise;
            isUploadedTos3 = true;

            logger.info(`file uploaded to s3 ${s3Key}`);
        } catch (err) {
            logger.error(err);
        } finally {
            const data = {
                fileName: fileName,
                s3Key: isUploadedTos3 ? encodeURIComponent(s3Key) : null,
                status: isUploadedTos3 ? constants.DOWNLOAD_HISTORY_STATUS.COMPLETED : constants.DOWNLOAD_HISTORY_STATUS.FAILED,
            };
            await downloadHistoryService.updateEntry({ data, id });
        }
    } catch (err) {
        logger.error(err);
        await downloadHistoryService.updateEntry({ data: { status: constants.DOWNLOAD_HISTORY_STATUS.FAILED }, id });
    }
};

const pushNotification = async (details) => {
    logger.info();

     const payload = JSON.stringify({Message:JSON.stringify({
        data :(JSON.stringify(details.data)),
        type : details.type
    })});

    const data = { url: constants.MOB_SQS[details.environment], payload} 
       
    logger.info(data.payload);
    return aws.sendSqsMessage(data);
};

module.exports = { getLeads, getStatusCount, downloadLeads , pushNotification};
