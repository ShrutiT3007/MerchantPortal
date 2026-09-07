const logger = require("./logger");
const { Buffer } = require('buffer');

const createEmailBody = ({ recipient, data }) => {
    logger.info("Generating email body with attachments");

    const boundary = `NextPart${Date.now()}`;
    const { attachment, taskSummary } = data;

    // Convert summary from taskSummary array
    const summaryLines = taskSummary.map(obj => {
        const [key , value] = Object.values(obj);
        return `${key.trim()} : ${value}`;
    });

    const headers = [
    `From: "Merchant Portal" <${process.env.EMAIL}>`,
    `To: ${recipient.join(",")}`,
    `Subject: EIL Newsletter`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    `Hi Team,`,
    ``,
    `Please find below the MCA summary (as of previous day):`,
    ``,
    ...summaryLines.map(line => `${line}`),
    ``,
    `Please refer to the attached CSV files for detailed information.`,
    ``,
    `Regards,`,
    `Merchant Portal`,
    ``,
];


    // Convert attachments to base64
    const attachmentParts = Object.entries(attachment).map(([filename, fileContent]) => {
        const base64Data = Buffer.from(fileContent).toString("base64");

        return [
            `--${boundary}`,
            `Content-Type: text/csv; name="${filename}.csv"`,
            `Content-Disposition: attachment; filename="${filename}.csv"`,
            `Content-Transfer-Encoding: base64`,
            ``,
            base64Data,
            ``,
        ].join("\r\n");
    });

    const closing = `--${boundary}--`;

    const rawEmail = [...headers, ...attachmentParts, closing].join("\r\n");

    return {
        RawMessage: { Data: rawEmail },
    };
};


module.exports = { createEmailBody };
