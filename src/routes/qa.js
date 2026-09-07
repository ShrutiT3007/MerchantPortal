const router = require("express").Router();

const qaController = require("../controllers/qa");
const joiMiddleware = require("../middlewares/joi");
const qaValidator = require("../validators/qa");

router.post("/test", joiMiddleware(qaValidator.test), qaController.test);
router.post("/test-sync", joiMiddleware(qaValidator.test), qaController.testSync);
router.post("/testcases", joiMiddleware(qaValidator.addTestcases), qaController.addTestcase);
router.post("/flow", joiMiddleware(qaValidator.createFlow), qaController.createFlow);
// router.get("/flow" , qaController)
router.post("/queries" , joiMiddleware(qaValidator.addQueries) , qaController.addQuery)
router.get("/queries" , joiMiddleware(qaValidator.getQueries) , qaController.getQuery);
router.get("/db-config"  , qaController.getDbs);
router.get("/function"  , qaController.getFunction);

module.exports = router;
