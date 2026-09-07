const express = require("express");
require("dotenv").config();
const moment = require("moment-timezone");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const constants = require("./constants");
const config = require("./src/config/config");
const logger = require("./src/utils/logger");
const startUpService = require("./src/services/startUp");
const expressRoutes = require("./src/routes/index");
const globalMiddlewares = require("./src/middlewares/global");

const app = express();

app.use(
	cors({
		origin: config.ALLOWED_ORIGINS,
  credentials: true,               
}));

app.use(cookieParser());
app.use(express.json({ limit: config.PAYLOAD_CONFIG.body}));
app.use(express.text({ limit: config.PAYLOAD_CONFIG.text }));
app.use(express.urlencoded({ extended: true }));

app.use(globalMiddlewares.setReqId);
app.use(globalMiddlewares.bodyParser);
app.use(globalMiddlewares.morganLogger);
app.use("/api/v1", expressRoutes);
app.use(globalMiddlewares.errorHandler);



startUpService
	.initialiseServer()
	.then(async () => {
        const port = process.env.PORT || 4000;
		app.listen(port);
		logger.info("server running on port " + port + ".");
	})
	.catch((err) => {
		logger.error("Could not start service", err);
		process.exit(1);
	});
