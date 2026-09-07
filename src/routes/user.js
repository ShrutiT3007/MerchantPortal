const router = require("express").Router();

const userController = require("../controllers/user");
const joiMiddleware = require("../middlewares/joi");
const userValidator = require("../validators/user");

router.get("/get-details", joiMiddleware(userValidator.getUserDetails), userController.getUserDetails);
router.get("/sign-out", userController.signOut);
router.put("/update", joiMiddleware(userValidator.updateUser), userController.updateUserDetails);

module.exports = router;
