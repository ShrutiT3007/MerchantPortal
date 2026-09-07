const router = require("express").Router();

const adminController = require("../controllers/admin");
const joiMiddleware = require("../middlewares/joi");
const adminValidator = require("../validators/admin");

router.post("/add-api-to-resource", joiMiddleware(adminValidator.addApisToResource), adminController.addApisToResource);
router.post("/add-resource-hierarchy", joiMiddleware(adminValidator.addResourceHierarchy), adminController.addResourceHierarchy);
router.post("/map-role-with-resource", joiMiddleware(adminValidator.mapRoleWithResource), adminController.mapRoleWithResource);
router.post("/add-role-hierarchy", joiMiddleware(adminValidator.addRoleHierarchy), adminController.addRoleHierarchy);
router.get("/get-users", joiMiddleware(adminValidator.getUsers), adminController.getUsers);
router.get("/get-role-and-resource", joiMiddleware(adminValidator.getApiRoleAndResource), adminController.getApiRoleAndResource);
router.get("/get-roles-mappings", joiMiddleware(adminValidator.getRolesMappings), adminController.getRolesMappings);
router.patch("/update-user", joiMiddleware(adminValidator.updateUser), adminController.updateUser);
router.post("/add-user-role", joiMiddleware(adminValidator.addUserRole), adminController.addUserRole);
router.post("/update-policy", joiMiddleware(adminValidator.updatePolicy), adminController.updatePolicy);
router.delete("/delete-policy", joiMiddleware(adminValidator.deletePolicy), adminController.deletePolicy);
router.post("/db-config", joiMiddleware(adminValidator.addDbConfig), adminController.addDbConfig);
router.post("/function", joiMiddleware(adminValidator.addOrUpdateFunction), adminController.addOrUpdateFunction);
router.post("/service", joiMiddleware(adminValidator.addService), adminController.addService);
router.delete("/service", joiMiddleware(adminValidator.deleteService), adminController.deleteService);
router.delete("/kill", joiMiddleware(adminValidator.executeQuery), adminController.kill);
router.delete("/query", joiMiddleware(adminValidator.executeQuery), adminController.executeQuery);
router.post("/trigger-mail",joiMiddleware(adminValidator.sendMail), adminController.triggerMail);
module.exports = router;
