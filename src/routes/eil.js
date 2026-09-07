const router = require("express").Router();

const eilController = require("../controllers/eil");
const joiMiddleware = require("../middlewares/joi");
const eilValidator = require("../validators/eil");

router.get("/get-loan-applications", joiMiddleware(eilValidator.getLoanApplications), eilController.getLoanApplications);
router.get("/summary", joiMiddleware(eilValidator.summary) ,eilController.getData);
router.post("/subscribe" , joiMiddleware(eilValidator.subscribe) ,eilController.subscribe)
router.post("/unsubscribe" , joiMiddleware(eilValidator.subscribe) ,eilController.unSubscribe);
router.get("/is-subscribed" , eilController.isSubscribed);
router.get("/get-migrated-merchants",joiMiddleware(eilValidator.getMigratedMerchants),eilController.getNonMigratedMerchants);

module.exports = router;
