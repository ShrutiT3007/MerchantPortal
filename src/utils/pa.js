const { generateRandomId, formatDateTime } = require("./common");

function createJsonMessageForTxn(merchantId, amount) {
    let merchantTransactionId = generateRandomId();
    let transactionTime = formatDateTime();
    let upiRefId = generateRandomId();
    let transactionId = generateRandomId();
    return {
        transactionRequestType: "PAY_TO_VPA",
        statusCode: "00",
        statusMessage: "TRANSACTION HAS BEEN APPROVED",
        merchantMetadata: {
            merchantTransactionId,
            merchantId,
            merchantChannelId: "faca830e9924006",
        },
        transactionTime,
        notifyType: "SEND_MONEY",
        id: "P2MNotificationController_payNotification_API-" + Date.now(),
        transactionId,
        payerVpa: "ishan1005@freecharge",
        payeeVpa: "fcbizigmf6e@freecharge",
        amount,
        payerName: "Rishabh",
        payeeName: "Aniket",
        upiRefId,
        accountType: "CREDIT",
    };
}

module.exports = {
    createJsonMessageForTxn,
};
