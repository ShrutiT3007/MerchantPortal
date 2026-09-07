// const redis = require("redis");
// const util = require("util");

// const logger = require("../utils/logger");
// const config = require("../config/config").redis;

// class RedisInstance {
//     static #instance;
//     // static #cacheClient
//     static #options = {
//         url: `redis://${config.host}:${config.port}`,
//         socket: {
//             reconnectStrategy: function (retries) {
//                 logger.warn(`Retrying Redis connection attempt: ${retries}`);
//                 if (retries > config.maxRetries) {
//                     return new Error("Retry attempts exhausted");
//                 }
//                 return Math.min(retries * 100, config.retryDelay);
//             },
//         },
//     };

//     constructor() {
//         if (RedisInstance.#instance) {
//             logger.error("RedisInstance already exists");
//             throw new Error("Use RedisInstance.getInstance() instead of new RedisInstance()");
//         }
//         logger.warn("New Redis Client Instance Created");
//     }

//     static async initialize() {
//         if (RedisInstance.#instance) {
//             throw new Error("Use RedisInstance.getInstance() instead of initialize()");
//         }

//         RedisInstance.#instance = new RedisInstance();
//         logger.info("Redis options:", RedisInstance.#options);

//         RedisInstance.#cacheClient = redis.createClient(RedisInstance.#options);

//         RedisInstance.#cacheClient.on("error", (err) => {
//             logger.error("Redis client error:", err);
//         });

//         RedisInstance.#cacheClient.on("reconnecting", () => {
//             logger.warn("Redis is reconnecting...");
//         });

//         try {
//             await RedisInstance.#cacheClient.connect();
//             logger.info("Connected to Redis");
//         } catch (err) {
//             logger.error("Could not connect to Redis:", err);
//             throw err;
//         }
//     }

//     static getInstance() {
//         if (!RedisInstance.#instance) {
//             throw new Error("Use RedisInstance.initialize() before getInstance()");
//         }
//         logger.info("Old Redis instance returned");
//         return RedisInstance.#instance;
//     }

//     getClient() {
//         return RedisInstance.#cacheClient;
//     }
// }

// module.exports = RedisInstance;
