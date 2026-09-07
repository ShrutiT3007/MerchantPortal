const router = require("express").Router();

const queueController = require("../controllers/sqs");
const joiMiddleware = require("../middlewares/joi");
const queueValidator = require("../validators/sqs");

router.get(
  "/getQueues",
  joiMiddleware( queueValidator.getQueues),
  queueController.getQueues
);

router.post(
  "/addQueue",
  joiMiddleware( queueValidator.addQueue),
  queueController.addQueue
);

router.put(
  "/updateQueue",
  joiMiddleware( queueValidator.updateQueue),
  queueController.updateQueue
);

router.delete(
  "/deleteQueue",
  joiMiddleware( queueValidator.deleteQueue),
  queueController.deleteQueue
);

router.post(
  "/retrieve-messages",
  joiMiddleware(queueValidator.retrieveMessages),
  queueController.retrieveMessages
);

module.exports = router;
