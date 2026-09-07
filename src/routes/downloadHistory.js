const router = require("express").Router();

const downloadHistoryController = require("../controllers/downloadHistory");
const joiMiddleware = require("../middlewares/joi");
const downloadHistoryValidator = require("../validators/downloadHistory");

router.get("/get", joiMiddleware(downloadHistoryValidator.getDownloadHistory), downloadHistoryController.getDownloadHistory);
router.get("/get-url", joiMiddleware(downloadHistoryValidator.getUrl), downloadHistoryController.getUrl);

module.exports = router;
