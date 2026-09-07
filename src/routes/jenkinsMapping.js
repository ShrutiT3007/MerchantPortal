const router = require("express").Router();

const jenkinsMappingController = require("../controllers/jenkinsMapping");
const joiMiddleware = require("../middlewares/joi");
const jenkinsMappingValidator = require("../validators/jenkinsMapping");

router.get("/", jenkinsMappingController.getMapping);
router.post("/add-mapping", joiMiddleware(jenkinsMappingValidator.addMapping), jenkinsMappingController.addMapping);
router.delete("/delete-mapping", joiMiddleware(jenkinsMappingValidator.deleteMapping), jenkinsMappingController.deleteMapping);

module.exports = router;
