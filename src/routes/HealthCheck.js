const httpStatus = require("http-status");

const router = require("express").Router();

router.get("/", (req, res, next) => {
    res.status(httpStatus.OK).send("ok");
});

module.exports = router;
