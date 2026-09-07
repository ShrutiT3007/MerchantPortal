const router = require("express").Router();

const paController = require("../controllers/pa");
const joiMiddleware = require("../middlewares/joi");
const paValidator = require("../validators/pa");

router.post("/create-transactions", joiMiddleware(paValidator.createTransactions), paController.createTransactions);
router.post("/create-transaction", joiMiddleware(paValidator.createTransaction), paController.createTransaction);

module.exports = router;
