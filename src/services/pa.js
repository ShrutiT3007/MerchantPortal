const axios = require("axios");

const logger = require("../utils/logger");
const { PA_RESOURCES, PA_ENDPOINTS , TXN } = require("../../constants");
const { createJsonMessageForTxn } = require("../utils/pa");

/**
 * Creates a transaction by sending a transaction message to the PA SQS endpoint.
 *
 * @param {string} environment - The environment to use (e.g., "qa", "staging").
 * @param {string} merchantId - The merchant's unique identifier.
 * @param {number} amount - The transaction amount.
 * @returns {Promise<Object>} The result object containing generated transaction fields.
 */
const createTransaction = async (environment, merchantId, amount) => {
    logger.info();
    const PA_SQS = PA_RESOURCES[environment].SQS.TRANSACTION;
    const PA_TXN_ENDPOINT = PA_ENDPOINTS[environment].CREATE_TRANSACTION;
    logger.debug("PA_SQS:", PA_SQS, " PA_TXN_ENDPOINT:", PA_TXN_ENDPOINT);
    const queueUrl = encodeURIComponent(PA_SQS);
    const jsonMessage = createJsonMessageForTxn(merchantId, amount);
    const jsonMessageEncoded = encodeURIComponent(JSON.stringify(jsonMessage));
    const url = `${PA_TXN_ENDPOINT}?queueUrl=${queueUrl}&jsonMessage=${jsonMessageEncoded}`;
    logger.debug("queueUrl:", queueUrl, " jsonMessage:", jsonMessage, " url:", url);
    await axios.post(url, null);
    logger.info("Transaction message sent to PA SQS");
    return {
        generatedFields: {
            merchantTransactionId: jsonMessage.merchantMetadata.merchantTransactionId,
            transactionTime: jsonMessage.transactionTime,
            transactionId: jsonMessage.transactionId,
            upiRefId: jsonMessage.upiRefId,
        },
    };
};

/**
 * @param {Object} messagePayload - { type, data } from frontend
 */
const buildSnsPayload = (messagePayload) => ({
  Type: "Notification",
  MessageId: `id-${Date.now()}`,
  TopicArn: TXN.TOPIC_ARN,
  Message: messagePayload,
  Timestamp: new Date().toISOString(),
  SignatureVersion: "1",
  Signature: "dummy-signature",
  SigningCertURL: TXN.SIGNING_CERT_URL,
  UnsubscribeURL: TXN.UNSUBSCRIBE_URL,
});

/**
 * @param {Object} messagePayload
 */
const sendTransaction = async (messagePayload) => {
  if (!messagePayload || !messagePayload.type || !messagePayload.data) {
    throw new Error("Both `type` and `data` fields are required");
  }

  const payload = buildSnsPayload(messagePayload);

  const response = await axios.post(TXN.ORCHESTRATOR_URL, payload, {
    headers: {
      "Content-Type": "application/json",
      "x-master-key": TXN.MASTER_KEY,
    },
  });

  return response.data;
};


module.exports = {
  sendTransaction,
  createTransaction
};
