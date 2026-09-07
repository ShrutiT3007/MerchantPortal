const router = require("express").Router();

const branchAlertsController = require("../controllers/branchesAlerts");
const joiMiddleware = require("../middlewares/joi");
const branchAlerts = require("../validators/branchAlerts");

router.get("/", joiMiddleware(branchAlerts.getBranches), branchAlertsController.getBranches);
router.patch("/deploy", joiMiddleware(branchAlerts.deployBranch), branchAlertsController.deployBranch);
router.patch("/promote", joiMiddleware(branchAlerts.updateBranch), branchAlertsController.promoteBranch);




module.exports = router;
