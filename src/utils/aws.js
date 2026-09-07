const AWS = require("aws-sdk");
const { toInteger } = require("lodash");
const moment = require("moment");

const logger = require("../utils/logger");
const constants = require("../../constants");
const localStorage = require("../utils/localStorage");

let sqs, s3, ses, sts;

const intilizeAWS = async () => {
    AWS.config.update({
        region: process.env.REGION,
        ...(process.env.ENVIRONMENT === constants.ENVIRONMENT.DEV && {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }),
    });

    sqs = new AWS.SQS();
    s3 = new AWS.S3();

    sts = new AWS.ChainableTemporaryCredentials({
        params: {
            RoleArn: process.env.SES_ARN,
            RoleSessionName: "CrossAccountSESAccess",
        },
    });

    ses = new AWS.SES({
        credentials: sts,
        region: "ap-south-1",
    });
};

const getQueueSize = async (url) => {
    try {
        const params = {
            QueueUrl: url,
            AttributeNames: ["ApproximateNumberOfMessages", "ApproximateNumberOfMessagesNotVisible"],
        };

        const data = await sqs.getQueueAttributes(params).promise();

        const size = toInteger(data.Attributes.ApproximateNumberOfMessages) + toInteger(data.Attributes.ApproximateNumberOfMessagesNotVisible);
        return size;
    } catch (err) {
        logger.error("Error fetching queue size:", err);
    }
};

async function sendSqsMessage(data = { url, payload }) {
    const params = {
        QueueUrl: data.url,
        MessageBody: data.payload,
    };
    return sqs.sendMessage(params).promise();
}

const getType = (key) => {
    logger.info();

    const fileTypes = {
        txt: "text/plain",
        html: "text/html",
        json: "application/json",
        csv: "text/csv",
        pdf: "application/pdf",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        xml: "application/xml",
        zip: "application/zip",
        mp4: "video/mp4",
        mp3: "audio/mp3",
        css: "text/css",
        js: "application/javascript",
        svg: "image/svg+xml",
        woff: "font/woff",
        woff2: "font/woff2",
        eot: "application/vnd.ms-fontobject",
        otf: "font/otf",
        ttf: "font/ttf",
        ico: "image/x-icon",
        webp: "image/webp",
        jsonld: "application/ld+json",
    };
    const extension = key.trim().split(".").pop().toLowerCase();
    return fileTypes[extension] ? fileTypes[extension] : "binary/octet-stream";
};

const createS3Parms = ({ s3Key, body = null, expiresInSeconds }) => {
    logger.info();

    const type = getType(s3Key);
    return {
        Bucket: process.env.S3_BUCKET,
        Key: s3Key,
        ...(body === null ? { Expires: expiresInSeconds } : { Body: body }),
        ContentType: type,
    };
};

const createS3Key = (fileName) => {
    const year = moment().year();
    const month = moment().month() + 1;
    const date = moment().date();
    const store = localStorage.getStore();
    const userId = store.get("userId") || "no-user";

    return `MP/${year}/${month}/${date}/${userId}/${Date.now()}_${fileName}`;
};

const extractFileNameFromS3Key = (s3Key) => {
    logger.info();

    if (typeof s3Key !== "string") return null;

    const lastSegment = s3Key.split("/").pop();

    if (!lastSegment) return null;

    const parts = lastSegment.split("_");

    if (parts.length < 2) return null;

    return parts.slice(1).join("_");
};

const uploadToS3 = async ({ s3Key = "", data, fileName = null }) => {
    logger.info();

    if (fileName) s3Key = createS3Key(fileName);
    const params = createS3Parms({ s3Key, body: data });
    return s3.upload(params).promise();
};

const getResourceReadStream = (key) => {
    logger.info();

    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: key,
    };
    return s3.getObject(params).createReadStream();
};

const getUploadUrl = async (s3Key, expiresInSeconds = 3000) => {
    logger.info();

    const params = createS3Parms({ s3Key, expiresInSeconds });

    return new Promise((resolve, reject) => {
        s3.getSignedUrl("putObject", params, (err, url) => {
            if (err) reject(err);
            else resolve(url);
        });
    });
};

const getReadUrl = (s3Key) => {
    logger.info();

    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: s3Key,
    };

    return new Promise((resolve, reject) => {
        s3.getSignedUrl("getObject", params, (err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    });
};

const sendMail = async (params) => {
    logger.info();

    return ses.sendRawEmail(params).promise();
};

const pollMessages = async (queueUrl) => {
    logger.info(queueUrl);

    const params = {
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 0,
        VisibilityTimeout: 1800,
    };

    return sqs.receiveMessage(params).promise();
};

module.exports = { getQueueSize, uploadToS3, uploadToS3, createS3Key, getResourceReadStream, getReadUrl, getUploadUrl, sendMail, sendSqsMessage, pollMessages , intilizeAWS };
