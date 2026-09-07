const router = require("express").Router();

const mobController = require("../controllers/mob");
const joiMiddleware = require("../middlewares/joi");
const mobValidator = require("../validators/mob");

router.get("/get-status-count", joiMiddleware(mobValidator.getStatusCount), mobController.getStatusCount);
router.get("/get-leads", joiMiddleware(mobValidator.getLeads), mobController.getLeads);
router.post("/notifications" , joiMiddleware(mobValidator.pushNotification) , mobController.pushNotification )

module.exports = router;
