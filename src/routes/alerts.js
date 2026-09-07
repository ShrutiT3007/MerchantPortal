const router = require("express").Router();

const alertsController = require("../controllers/alerts");

router.post("/push/:serviceName", alertsController.push);

module.exports = router;
