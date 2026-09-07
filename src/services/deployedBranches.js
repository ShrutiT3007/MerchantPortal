const { Op } = require("sequelize");
const { CronJob } = require("cron");

const logger = require("../utils/logger");
const deployedBranchesModel = require("../database/MP/models/deployedBranches");
const promotedBranchesModel = require("../database/MP/models/promotedBranches");
const common = require("../utils/common");

const getBranches = async (filter) => {
    logger.info();

    return deployedBranchesModel.getBranches({ filter });
};

const deployBranch = async (data) => {
    logger.info(data);

    const filter = { ip: data.ip };
    let branchName = data.branchName;
    
    if (!data.branchName) {
        const promotedBranch = await promotedBranchesModel.getBranch({ filter: { serviceName: data.serviceName, jenkinsId: data.jenkinsId } });
        branchName = promotedBranch.branchName;
    }

    const [deployedBranch] = await deployedBranchesModel.getBranches({ filter });
    if (deployedBranch.branchName != branchName) {
        data.oldBranch = deployedBranch.branchName ? deployedBranch.branchName : "none";
        data.branchName = branchName;
        await common.sendToGoogleChat(createMessage(data), deployedBranch.chatUrl);
    }
    return deployedBranchesModel.update({ filter, data });
};

const addServer = async (details) => {
    logger.info();

    return deployedBranchesModel.addServer(details);
};

const deleteServer = async (id) => {
    logger.info();

    return deployedBranchesModel.deleteServer(id);
};

const createMessage = (data) => {
    logger.info();
    let payload;

    if (data.personName) {
        payload = `🚨 *${data.serviceName} new Deployment Alert*\n  \`${data.personName}\` has deployed new branch from \`${data.oldBranch}\` to \`${data.branchName}\` on \`${data.ip}\` 🥷.`;
    } else {
        payload = `🚨 *${data.serviceName} new Deployment Alert*\n  *Someone* has changed branch from \`${data.oldBranch}\` to \`${data.branchName}\` on \`${data.ip}\` 🥷.`;
    }
    return { text: payload };
};

const watchmanJob = new CronJob(
    "0 10 * * *",
    async () => {
        try {
            const data = await deployedBranchesModel.getBranches({});
            const payloads = {};

            const pad = (text, length) => {
                const str = text?.toString() ?? "";

                // Estimate visible width (basic rule: emoji chars often count as width 2)
                const getVisibleWidth = (s) => {
                    return Array.from(s).reduce((sum, ch) => {
                        const code = ch.codePointAt(0);
                        return sum + (code > 0x1f000 ? 2 : 1); // emojis and wide symbols
                    }, 0);
                };

                let visibleLength = getVisibleWidth(str);

                // If string fits, pad it
                if (visibleLength <= length) {
                    return str + " ".repeat(length - visibleLength);
                }

                // Truncate string with ellipsis "..." (3 visible width)
                const truncated = [];
                let width = 0;
                for (const ch of Array.from(str)) {
                    const chWidth = ch.codePointAt(0) > 0x1f000 ? 2 : 1;
                    if (width + chWidth >= length - 3) break;
                    truncated.push(ch);
                    width += chWidth;
                }
                return truncated.join("") + "...";
            };

            data.forEach((element) => {
                const { chatUrl, serviceName, status, ip, branchName, personName } = element;

                if (!payloads[chatUrl]) {
                    payloads[chatUrl] = `Good Morning Everyone, Please find the branch status below! 👮‍♂️\n\n`;
                }

                const statusIcon = status === null ? "🟡" : status ? "🟢" : "🔴";

                const col1 = `\`${pad(serviceName, 10)}\``;
                const col2 = `\`${pad(ip, 18)}\``;
                const col3 = `\`${pad(branchName || "No branch deployed", 22)}\``;
                const col4 = `\`${pad(personName || "🤷‍♂️", 13)}\``;

                const row = `${statusIcon}  : ${col1} : ${col2} : ${col3} : ${col4}\n`;
                payloads[chatUrl] += row;
            });

            const promiseArr = Object.entries(payloads).map(([key, value]) => {
                return common.sendToGoogleChat(value, key);
            });

            await Promise.all(promiseArr);
        } catch (err) {
            logger.error(err);
        }
    },
    null,
    true,
    "Asia/Kolkata"
);

module.exports = {
    getBranches,
    deleteServer,
    addServer,
    deployBranch,
    watchmanJob,
};
