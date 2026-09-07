const router = require("express").Router();

const adminRoute = require("./admin");
const authRoute = require("./auth");
const eilRoute = require("./eil");
const mobRoute = require("./mob");
const sqs = require("./sqs");
const userRoute = require("./user");
const branchAlertsRoute = require("./branchAlerts");
const downloadHistoryRoute = require("./downloadHistory");
const healthCheckRoute = require("./HealthCheck");
const jenkinsMappingRoute = require("./jenkinsMapping");
const qaRoute = require("./qa");
const paRoute = require("./pa");
const authMiddleware = require("../middlewares/auth");

router.use("/admin", authMiddleware, adminRoute);
router.use("/auth", authRoute);
router.use("/health",healthCheckRoute)
router.use("/eil", authMiddleware, eilRoute);
router.use("/mob",authMiddleware, mobRoute);
router.use("/sqs",authMiddleware, sqs);
router.use("/user", authMiddleware, userRoute);
router.use("/download-history", authMiddleware, downloadHistoryRoute);
router.use("/branch-alerts", authMiddleware, branchAlertsRoute);
router.use("/jenkins", authMiddleware, jenkinsMappingRoute);
router.use("/qa-testing", qaRoute);
router.use("/pa", authMiddleware, paRoute);

module.exports = router;
