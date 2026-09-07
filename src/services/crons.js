const { CronJob } = require("cron");
const { Op } = require("sequelize");
const moment = require("moment");

const logger = require("../utils/logger");
const aws = require("../utils/aws");
const commonUtil = require("../utils/common");
const constants = require("../../constants");
const lockService = require("./locks");
const refreshCredentials = require("./refershCredentials");
const { watchmanJob } = require("./deployedBranches");
const { newsLetterJob } = require("./eil");
const AuthorizationUtil = require("../utils/casbin");
const sqsService = require("./sqs");

const runningCrons = {};

const startCrons = async () => {
    logger.info("crons starting");

    const queuesData = await sqsService.getQueues({isActive : true})
    await mountSqsMonitoring(queuesData);
    deleteLocksCron.start();
    refreshCredentials.start();
    watchmanJob.start();
    newsLetterJob.start();
    refreshCasbin.start();
    refreshSqsCrons.start();
};

const mountSqsMonitoring = async(entries)=>{
    logger.info();

    entries.forEach(({ dataValues }) => {
        const { id, ...data } = dataValues;
        if(runningCrons[id]){
            deleteCron(id);
        }
        if(data.isActive){
        addCron({ id, data });
        }
    });
}

const demountSqsMonitoring = async()=>{
    logger.info();

    Object.keys(runningCrons).forEach((key)=>{deleteCron(key)});
}

const getRunningCrons = (id) => {
    logger.info();

    if (id) {
        return runningCrons[id];
    }
    return runningCrons;
};

const deleteCron = (id) => {
    logger.info();

    if (!runningCrons[id]) return;

    runningCrons[id].stop();
    delete runningCrons[id];
};

const updateCron = ({ id, data }) => {
    logger.info();

    if (!runningCrons[id]) throw new Error(constants.ERROR_MESSAGE.NOT_FOUND);

    runningCrons[id].stop();

    addCron({ id, data });
};

const createSqsMessage = (name, id, queueSize) => {
    logger.info();

    return {
        cards: [
            {
                header: {
                    title: "🚨 SQS Queue Alert",
                    subtitle: "Queue threshold exceeded - immediate attention required",
                },
                sections: [
                    {
                        widgets: [
                            {
                                keyValue: {
                                    topLabel: "Queue Name",
                                    content: `${name}`,
                                    contentMultiline: false,
                                    icon: "DESCRIPTION",
                                },
                            },
                            {
                                keyValue: {
                                    topLabel: "Queue ID",
                                    content: `${id}`,
                                    contentMultiline: false,
                                    icon: "BOOKMARK",
                                },
                            },
                            {
                                keyValue: {
                                    topLabel: "Message Count",
                                    content: `${queueSize}`,
                                    contentMultiline: false,
                                    icon: "EMAIL",
                                },
                            },
                            {
                                keyValue: {
                                    topLabel: "Status",
                                    content: "⚠️ THRESHOLD EXCEEDED",
                                    contentMultiline: false,
                                    icon: "STAR",
                                },
                            },
                        ],
                    },
                    {
                        widgets: [
                            {
                                textParagraph: {
                                    text: "<b>Action Required:</b> Please investigate the queue backlog immediately to prevent service disruption.",
                                },
                            },
                        ],
                    },
                    {
                        widgets: [
                            {
                                textParagraph: {
                                    text: `<font color=\"#666666\"><i>Alert triggered at: ${moment().format("YYYY-MM-DD HH:mm:ss")}  </i></font>`,
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    };
};

const addCron = ({ id, data }) => {
    logger.info();

    runningCrons[id] = new CronJob(
        data.cronTime,
        async () => {
            let isLockAcquired = false;
            let isAlertTriggered = false;
            try {
                await lockService.applylock(id);
                isLockAcquired = true;

                logger.info(`Cron with id ${id} running`);
                const queueSize = await aws.getQueueSize(data.url);

                logger.info(`for sqs queue id:${id} , queue size is:${queueSize}`);

                if (queueSize > data.threshold) {
                    logger.warn(`Sqs queue threshold limit exceeded`);
                    const message = createSqsMessage(data.name, id, queueSize);
                    const webhookUrl = data.chatUrl;
                    await commonUtil.sendToGoogleChat(message, webhookUrl);
                    isAlertTriggered = true;
                }
            } catch (err) {
                if (err.name !== "SequelizeUniqueConstraintError") logger.error(err);
            } finally {
                if (isLockAcquired) {
                    let setTimeoutDelay = 30000;
                    if(isAlertTriggered){
                        await lockService.extendLockTime(id , data.alertDelay);
                        setTimeoutDelay = data.alertDelay * 60 * 1000;
                    }
                    setTimeout(async () => {
                        await lockService.releaseLock({ id: id });
                        logger.info(`lock released for cronId ${id} `);
                    }, setTimeoutDelay);
                }
            }
        },
        null,
        true,
        "Asia/Kolkata"
    );

    runningCrons[id].start();
    logger.info(`Sqs monitoring cron with id : ${id} mounted`);
};

const deleteLocksCron = new CronJob("*/2 * * * *", async () => {
    logger.info("delete locks cron running");

    const time = moment().subtract(2, "minutes").format("YYYY-MM-DD HH:mm:ss");

    const filter = {
        CreatedAt: {
            [Op.lte]: time,
        },
    };

    const response = await lockService.releaseLock(filter);
    logger.info(`auto delete cron complete ${response}`);
});

const refreshCasbin = new CronJob("*/2 * * * *", async () => {
    logger.info("refreshing casbin rule");
    try {
        await AuthorizationUtil.getInstance().loadPolicy();
    } catch (err) {
        logger.error(err);
    }
});

const refreshSqsCrons = new CronJob("*/5 * * * *", async () => {
    logger.info("Refresh sqs monitoring Cron running");

    const updatedAt = moment().subtract(5, "minutes").format("YYYY-MM-DD HH:mm:ss");

    const queues = await sqsService.getQueues({updatedAt});
    mountSqsMonitoring(queues);
    logger.info(`Refersh sqs monitering cron completed`);
});

module.exports = { startCrons, getRunningCrons, deleteCron, updateCron, addCron , demountSqsMonitoring };
