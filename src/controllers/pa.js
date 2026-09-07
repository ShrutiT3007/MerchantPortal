const httpStatus = require("http-status");

const logger = require("../utils/logger");
const constants = require("../../constants");
const paService = require("../services/pa");
const response = require("../utils/response");

const createTransaction = async (req, res, next) => {
    logger.info();
    try {
        const data = await paService.createTransaction(req.body.environment, req.body.merchantId, req.body.amount);
        res.status(httpStatus.OK).json(response.successResponse(constants.SUCCESS_MESSAGE.TRANSACTION_CREATED_SUCCESSFULLY, data));
    } catch (err) {
        next(err);
    }
};

const createTransactions = async (req, res) => {
  try {
    const { type, data } = req.body;

    if (!type || !data) {
      return res.status(400).json({ error: "`type` and `data` fields are required" });
    }

    const result = await paService.sendTransaction({ type, data });

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      error: err.response?.data || err.message,
    });
  }
};

module.exports = {
  createTransactions,
  createTransaction
};