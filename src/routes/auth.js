const router = require("express").Router();

const authController = require("../controllers/auth");
const joiMiddleware = require("../middlewares/joi");
const authValidator = require("../validators/auth");

router.post("/signin", joiMiddleware(authValidator.signIn), authController.signIn);
router.post("/signup", joiMiddleware(authValidator.signUp), authController.signUp);

module.exports = router;
