const _ = require("lodash");
const { default: axios } = require("axios");
const { stringify } = require("csv-stringify/sync");
const stream = require("stream");
const fastcsv = require("fast-csv");
const moment = require("moment");
const FormData = require("form-data");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const axiosRetry = require("axios-retry").default;
axiosRetry(axios, {
    retries: 3, // number of retries
    retryDelay: (retryCount) => retryCount * 1000, // 1s, 2s, 3s backoff
    retryCondition: (error) => {
        // Retry on network errors or 5xx responses
        return error.code === "ECONNABORTED" || axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error);
    },
});

const logger = require("../utils/logger");
const constants = require("../../constants");
const aws = require("../utils/aws");
const downloadHistoryService = require("./downloadHistory");
const qaFlowService = require("./qaFlows");
const testcasesService = require("./testcases");
const locksService = require("./locks");
const cachedMemory = require("../utils/cachedMemory");
const queriesService = require("./queries");
const commonStorageService = require("./commonStorage");
const { stat } = require("fs");

const uploadedConfirmation = async ({ id }) => {
    logger.info();

    return qaWorkBooksService.updateWorkBook({ id, isUploaded: true });
};

const test = async ({ testcases, flowId, servicesUrls }, id) => {
    logger.info();

    const getAllTestCases = (allTestcases, testcases) => {
        logger.info("insde getAllTestCases function");

        const set1 = new Set(allTestcases);
        for (const key of testcases) {
            if (!set1.has(key)) {
                allTestcases.push(key);
                set1.add(key);
            }
        }
        return allTestcases;
    };

    try {
        const [flowDetails] = await qaFlowService.getFlow({ id: flowId });
        const flowSavedData = flowDetails.dataValues.data;

        const allTestcases = Object.keys(flowDetails.flow).map(Number);
        getAllTestCases(allTestcases, testcases);

        const fileHeaders = constants.QA_FILE_HEADERS;
        let rowNum = 1;
        let isError = false;
        let pageNumber = 1;
        const limit = constants.BATCH_SIZE;
        let isFirstRow = true;
        let batch = [];

        const uploadStream = new stream.PassThrough();
        const uploadS3Key = aws.createS3Key(`result_${flowDetails.flowName}.csv`);
        const s3UploadPromise = aws.uploadToS3({ s3Key: uploadS3Key, data: uploadStream });

        const processResults = async () => {
            const results = [];

            const sendRequest = async (axiosPromise) => {
                logger.info("sending request");

                try {
                    const response = await axiosPromise;
                    return response;
                } catch (err) {
                    if (!err.response) {
                        throw err;
                    }
                    return err.response;
                }
            };
            const execQuery = async (queryDetails) => {
                logger.info(queryDetails);

                const db = cachedMemory.dbs[queryDetails.dbId];
                let query = replaceVariables(queryDetails.query, flowSavedData);
                query = replaceValueFromFunction(query, { flowSavedData });
                const result = await db.query(query, { type: db.QueryTypes[queryDetails.queryType] });

                if (queryDetails.queryType === "SELECT") {
                    return result.length ? true : false;
                } else if (queryDetails.queryType === "UPDATE") {
                    return result.affectedRows && result.changedRows;
                }
                return result.affectedRows ? true : false;
            };
            const evaluateExpression = async (expr) => {
                const precedence = { "||": 1, "&&": 2, "^": 3, "!": 4 };
                const operators = [];
                const values = [];

                const applyOp = () => {
                    const op = operators.pop();

                    if (op === "!") {
                        const a = values.pop();
                        values.push(!a);
                    } else {
                        const b = values.pop();
                        const a = values.pop();

                        switch (op) {
                            case "&&":
                                values.push(a && b);
                                break;
                            case "||":
                                values.push(a || b);
                                break;
                            case "^":
                                values.push(Boolean(a) ^ Boolean(b));
                                break;
                        }
                    }
                };

                const tokens = expr.match(/\d+|&&|\|\||\^|!|\(|\)/g);

                for (let token of tokens) {
                    if (/^\d+$/.test(token)) {
                        const queryDetails = await queriesService.getQuery({ id: Number(token) });
                        const result = await execQuery(queryDetails);
                        values.push(result);
                    } else if (token === "(") {
                        operators.push(token);
                    } else if (token === ")") {
                        while (operators.length && operators[operators.length - 1] !== "(") {
                            applyOp();
                        }
                        operators.pop(); // remove "("
                    } else {
                        // operator
                        while (operators.length && operators[operators.length - 1] !== "(" && precedence[operators[operators.length - 1]] >= precedence[token]) {
                            applyOp();
                        }
                        operators.push(token);
                    }
                }

                while (operators.length) {
                    applyOp();
                }

                return values.pop();
            };
            const replaceVariables = (str, values) => {
                if (typeof str !== "string") return str;

                if (/<[^>]+>/.test(str)) {
                    return str;
                }

                if (/^\$\{([^}]+)\}$/.test(str)) {
                    const key = str.slice(2, -1).trim();
                    if (Object.prototype.hasOwnProperty.call(values, key)) {
                        return values[key];
                    }
                    return str;
                }

                let replaced = false;
                let result = str;

                result = result.replace(/\$\{([^}]+)\}/g, (match, key) => {
                    key = key.trim();
                    if (Object.prototype.hasOwnProperty.call(values, key)) {
                        replaced = true;
                        return values[key];
                    }
                    return match;
                });

                return replaced ? result : str;
            };

            const replaceValueFromFunction = (str, values) => {
                if (typeof str !== "string") return str;

                if (/<[^>]+>/.test(str)) {
                    return str;
                }

                if (/^\{\{([^}]+)\}\}$/.test(str)) {
                    const key = str.slice(2, -2).trim();
                    if (cachedMemory.functions[key]) {
                        const functionValue = cachedMemory.functions[key];
                        eval(functionValue);
                        return eval(`${key}(values)`);
                    }
                    return str;
                }

                let replaced = false;
                let result = str;

                result = result.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
                    key = key.trim();
                    replaced = true;
                    const functionValue = cachedMemory.functions[key];
                    eval(functionValue);
                    return eval(`${key}(values)`);
                });
                function typecast(val) {
                    const num = _.toNumber(val);
                    return _.isNaN(num) ? val : num;
                }
                return replaced ? typecast(result) : str;
            };
            const extractS3Key = (value) => {
                if (typeof value !== "string") {
                    return null;
                }

                const match = value.match(/<([^<>]+)>/);
                return match ? match[1] : null;
            };

            function deepReplace(obj, transformFn, flowSavedData) {
                if (typeof obj === "string") {
                    return transformFn(obj, flowSavedData);
                }

                if (Array.isArray(obj)) {
                    for (let i = 0; i < obj.length; i++) {
                        obj[i] = deepReplace(obj[i], transformFn, flowSavedData);
                    }
                    return obj; // mutated array
                }

                if (obj && typeof obj === "object") {
                    for (const key in obj) {
                        if (Object.prototype.hasOwnProperty.call(obj, key)) {
                            obj[key] = deepReplace(obj[key], transformFn, flowSavedData);
                        }
                    }
                    return obj; // mutated object
                }

                // numbers, booleans, null, undefined
                return obj;
            }

            for (const row of batch) {
                let response;
                try {
                    const data = row.body ? row.body : {};

                    deepReplace(data, replaceVariables, flowSavedData);

                    const headers = row.headers ? row.headers : {};

                    deepReplace(headers, replaceVariables, flowSavedData);

                    const params = row.params ? row.params : {};
                    deepReplace(params, replaceVariables, flowSavedData);

                    deepReplace(headers, replaceValueFromFunction, flowSavedData);

                    deepReplace(params, replaceValueFromFunction, flowSavedData);

                    deepReplace(data, replaceValueFromFunction, flowSavedData);

                    const url = replaceVariables(row.url, servicesUrls);
                    if (headers["content-type"] === "form-data") {
                        delete headers["content-type"];
                        const form = new FormData();
                        Object.entries(data).forEach(([key, value]) => {
                            const s3Key = extractS3Key(value);
                            if (s3Key) {
                                form.append(key, aws.getResourceReadStream(decodeURIComponent(s3Key)), { filename: `key.${aws.extractFileNameFromS3Key(decodeURIComponent(s3Key))}` });
                            } else {
                                form.append(key, value);
                            }
                        });

                        response = await sendRequest(axios[row.method](url, form, { headers: { ...headers, ...form.getHeaders() }, params }));
                    } else {
                        if (row.method === "get") {
                            response = await sendRequest(axios[row.method](url, { headers, params }));
                        } else {
                            response = await sendRequest(axios[row.method](url, data, { headers, params }));
                        }
                    }
                    if (flowDetails.flow[row.id]) {
                        function getValueByPath(obj, path) {
                            return path.split(".").reduce((acc, part) => acc?.[part], obj);
                        }
                        Object.entries(flowDetails.flow[row.id]).forEach(([key, value]) => {
                            if (value === "Cookies") {
                                const setCookies = getValueByPath(response, key) || [];
                                const cookies = setCookies.map((c) => c.split(";")[0]);
                                flowSavedData[value] = cookies.join("; ");
                            } else {
                                flowSavedData[value] = getValueByPath(response, key);
                            }
                        });
                    }
                    const validate = ajv.compile(row.expectedOutput);
                    const valid = validate(response.data);
                    row.apiResponse = JSON.stringify({
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers,
                        data: response.data,
                    });
                    if (valid) {
                        row.output = "Api response is valid ";
                        if (row.dbQueries) {
                            try {
                                await new Promise((resolve) => setTimeout(resolve, row.delay * 1000));
                                const queryResult = await evaluateExpression(row.dbQueries);
                                if (!queryResult) {
                                    row.output += queryResult ? "And Query result matched " : "but db queries failed to match";
                                }
                            } catch (err) {
                                row.output += "but Error in executing queries...." + JSON.stringify(err);
                            }
                        }
                    } else {
                        row.output = JSON.stringify(validate.errors);
                    }
                } catch (err) {
                    logger.error(err);
                    row.apiResponse = JSON.stringify(err);
                    row.output = "failed";
                }

                row["Testcase id"] = rowNum++;
                if(row.dbQueries && row.dbQueries.length ===3){
                    row.dbQueries = "`"+`${row.dbQueries}`
                }
                results.push(row);
            }
            const chunk = stringify(results, { header: isFirstRow, columns: fileHeaders });
            isFirstRow = false;
            uploadStream.write(chunk);

            batch = [];
        };

        try {
            while (true) {
                batch = await testcasesService.getTestCasesInSpecificOrder(pageNumber, limit, allTestcases);
                pageNumber++;

                await processResults();
                if (batch.length < limit) {
                    break;
                }
            }
        } catch (err) {
            logger.error(`Error in processing qa testcases with flowId: ${flowId}`);
            isError = true;
            uploadStream.destroy(err);
        }

        let isUploadedTos3 = true;
        try {
            if (!isError) {
                uploadStream.end();
                await s3UploadPromise;
                logger.info("file uploaded on s3");
            }
        } catch (err) {
            isError = true;
            isUploadedTos3 = false;
        } finally {
            const data = {
                fileName: "QA_result" + moment().toISOString(),
                s3Key: isUploadedTos3 && !isError ? encodeURIComponent(uploadS3Key) : null,
                status: isUploadedTos3 && !isError ? constants.DOWNLOAD_HISTORY_STATUS.COMPLETED : constants.DOWNLOAD_HISTORY_STATUS.FAILED,
            };
            await downloadHistoryService.updateEntry({ data, id });
            await qaFlowService.updateFlow({ data: flowSavedData, id: flowDetails.id });
            await locksService.releaseLock({ id: constants.QA_TEST_LOCK_PADDING + flowId });
        }
    } catch (err) {
        logger.error(err);
    }
};


const testSync = async ({ testcases, flowId, servicesUrls }) => {
    logger.info();

    const getAllTestCases = (allTestcases, testcases) => {
        logger.info("insde getAllTestCases function");

        const set1 = new Set(allTestcases);
        for (const key of testcases) {
            if (!set1.has(key)) {
                allTestcases.push(key);
                set1.add(key);
            }
        }
        return allTestcases;
    };

    try {
        const [flowDetails] = await qaFlowService.getFlow({ id: flowId });
        const flowSavedData = flowDetails.dataValues.data;

        const allTestcases = Object.keys(flowDetails.flow).map(Number);
        getAllTestCases(allTestcases, testcases);

        const fileHeaders = constants.QA_FILE_HEADERS;
        let rowNum = 1;
        let isError = false;
        let pageNumber = 1;
        const limit = constants.BATCH_SIZE;
        let isFirstRow = true;
        let batch = [];
        const results = [];

        const processResults = async () => {
            

            const sendRequest = async (axiosPromise) => {
                logger.info("sending request");

                try {
                    const response = await axiosPromise;
                    return response;
                } catch (err) {
                    if (!err.response) {
                        throw err;
                    }
                    return err.response;
                }
            };
            const execQuery = async (queryDetails) => {
                logger.info(queryDetails);

                const db = cachedMemory.dbs[queryDetails.dbId];
                let query = replaceVariables(queryDetails.query, flowSavedData);
                query = replaceValueFromFunction(query, { flowSavedData });
                const result = await db.query(query, { type: db.QueryTypes[queryDetails.queryType] });

                if (queryDetails.queryType === "SELECT") {
                    return result.length ? true : false;
                } else if (queryDetails.queryType === "UPDATE") {
                    return result.affectedRows && result.changedRows;
                }
                return result.affectedRows ? true : false;
            };
            const evaluateExpression = async (expr) => {
                const precedence = { "||": 1, "&&": 2, "^": 3, "!": 4 };
                const operators = [];
                const values = [];

                const applyOp = () => {
                    const op = operators.pop();

                    if (op === "!") {
                        const a = values.pop();
                        values.push(!a);
                    } else {
                        const b = values.pop();
                        const a = values.pop();

                        switch (op) {
                            case "&&":
                                values.push(a && b);
                                break;
                            case "||":
                                values.push(a || b);
                                break;
                            case "^":
                                values.push(Boolean(a) ^ Boolean(b));
                                break;
                        }
                    }
                };

                const tokens = expr.match(/\d+|&&|\|\||\^|!|\(|\)/g);

                for (let token of tokens) {
                    if (/^\d+$/.test(token)) {
                        const queryDetails = await queriesService.getQuery({ id: Number(token) });
                        const result = await execQuery(queryDetails);
                        values.push(result);
                    } else if (token === "(") {
                        operators.push(token);
                    } else if (token === ")") {
                        while (operators.length && operators[operators.length - 1] !== "(") {
                            applyOp();
                        }
                        operators.pop(); // remove "("
                    } else {
                        // operator
                        while (operators.length && operators[operators.length - 1] !== "(" && precedence[operators[operators.length - 1]] >= precedence[token]) {
                            applyOp();
                        }
                        operators.push(token);
                    }
                }

                while (operators.length) {
                    applyOp();
                }

                return values.pop();
            };
            const replaceVariables = (str, values) => {
                if (typeof str !== "string") return str;

                if (/<[^>]+>/.test(str)) {
                    return str;
                }

                if (/^\$\{([^}]+)\}$/.test(str)) {
                    const key = str.slice(2, -1).trim();
                    if (Object.prototype.hasOwnProperty.call(values, key)) {
                        return values[key];
                    }
                    return str;
                }

                let replaced = false;
                let result = str;

                result = result.replace(/\$\{([^}]+)\}/g, (match, key) => {
                    key = key.trim();
                    if (Object.prototype.hasOwnProperty.call(values, key)) {
                        replaced = true;
                        return values[key];
                    }
                    return match;
                });

                return replaced ? result : str;
            };

            const replaceValueFromFunction = (str, values) => {
                if (typeof str !== "string") return str;

                if (/<[^>]+>/.test(str)) {
                    return str;
                }

                if (/^\{\{([^}]+)\}\}$/.test(str)) {
                    const key = str.slice(2, -2).trim();
                    if (cachedMemory.functions[key]) {
                        const functionValue = cachedMemory.functions[key];
                        eval(functionValue);
                        return eval(`${key}(values)`);
                    }
                    return str;
                }

                let replaced = false;
                let result = str;

                result = result.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
                    key = key.trim();
                    replaced = true;
                    const functionValue = cachedMemory.functions[key];
                    eval(functionValue);
                    return eval(`${key}(values)`);
                });
                function typecast(val) {
                    const num = _.toNumber(val);
                    return _.isNaN(num) ? val : num;
                }
                return replaced ? typecast(result) : str;
            };
            const extractS3Key = (value) => {
                if (typeof value !== "string") {
                    return null;
                }

                const match = value.match(/<([^<>]+)>/);
                return match ? match[1] : null;
            };

            function deepReplace(obj, transformFn, flowSavedData) {
                if (typeof obj === "string") {
                    return transformFn(obj, flowSavedData);
                }

                if (Array.isArray(obj)) {
                    for (let i = 0; i < obj.length; i++) {
                        obj[i] = deepReplace(obj[i], transformFn, flowSavedData);
                    }
                    return obj; // mutated array
                }

                if (obj && typeof obj === "object") {
                    for (const key in obj) {
                        if (Object.prototype.hasOwnProperty.call(obj, key)) {
                            obj[key] = deepReplace(obj[key], transformFn, flowSavedData);
                        }
                    }
                    return obj; // mutated object
                }

                // numbers, booleans, null, undefined
                return obj;
            }

            for (const row of batch) {
                let response;
                try {
                    const data = row.body ? row.body : {};

                    deepReplace(data, replaceVariables, flowSavedData);

                    const headers = row.headers ? row.headers : {};

                    deepReplace(headers, replaceVariables, flowSavedData);

                    const params = row.params ? row.params : {};
                    deepReplace(params, replaceVariables, flowSavedData);

                    deepReplace(headers, replaceValueFromFunction, flowSavedData);

                    deepReplace(params, replaceValueFromFunction, flowSavedData);

                    deepReplace(data, replaceValueFromFunction, flowSavedData);

                    const url = replaceVariables(row.url, servicesUrls);
                    if (headers["content-type"] === "form-data") {
                        delete headers["content-type"];
                        const form = new FormData();
                        Object.entries(data).forEach(([key, value]) => {
                            const s3Key = extractS3Key(value);
                            if (s3Key) {
                                form.append(key, aws.getResourceReadStream(decodeURIComponent(s3Key)), { filename: `key.${aws.extractFileNameFromS3Key(decodeURIComponent(s3Key))}` });
                            } else {
                                form.append(key, value);
                            }
                        });

                        response = await sendRequest(axios[row.method](url, form, { headers: { ...headers, ...form.getHeaders() }, params }));
                    } else {
                        if (row.method === "get") {
                            response = await sendRequest(axios[row.method](url, { headers, params }));
                        } else {
                            response = await sendRequest(axios[row.method](url, data, { headers, params }));
                        }
                    }
                    if (flowDetails.flow[row.id]) {
                        function getValueByPath(obj, path) {
                            return path.split(".").reduce((acc, part) => acc?.[part], obj);
                        }
                        Object.entries(flowDetails.flow[row.id]).forEach(([key, value]) => {
                            if (value === "Cookies") {
                                const setCookies = getValueByPath(response, key) || [];
                                const cookies = setCookies.map((c) => c.split(";")[0]);
                                flowSavedData[value] = cookies.join("; ");
                            } else {
                                flowSavedData[value] = getValueByPath(response, key);
                            }
                        });
                    }
                    const validate = ajv.compile(row.expectedOutput);
                    const valid = validate(response.data);
                    row.apiResponse = JSON.stringify({
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers,
                        data: response.data,
                    });
                    if (valid) {
                        row.output = "Api response is valid ";
                        if (row.dbQueries) {
                            try {
                                await new Promise((resolve) => setTimeout(resolve, row.delay * 1000));
                                const queryResult = await evaluateExpression(row.dbQueries);
                                if (!queryResult) {
                                    row.output += queryResult ? "And Query result matched " : "but db queries failed to match";
                                }
                            } catch (err) {
                                row.output += "but Error in executing queries...." + JSON.stringify(err);
                            }
                        }
                    } else {
                        row.output = JSON.stringify(validate.errors);
                    }
                } catch (err) {
                    logger.error(err);
                    row.apiResponse = JSON.stringify(err);
                    row.output = "failed";
                }

                row["Testcase id"] = rowNum++;
                if(row.dbQueries && row.dbQueries.length ===3){
                    row.dbQueries = "`"+`${row.dbQueries}`
                }
                const responseToPush = {id: row.id, output: row.output, apiResponse: row.apiResponse}; 
                results.push(responseToPush);
            }
            batch = [];
        };

        try {
            while (true) {
                batch = await testcasesService.getTestCasesInSpecificOrder(pageNumber, limit, allTestcases);
                pageNumber++;

                await processResults();
                if (batch.length < limit) {
                    break;
                }
            }
        } catch (err) {
            logger.error(`Error in processing qa testcases with flowId: ${flowId}`);
            throw err;
        }
           
        await qaFlowService.updateFlow({ data: flowSavedData, id: flowDetails.id });
        await locksService.releaseLock({ id: constants.QA_TEST_LOCK_PADDING + flowId });
        return results;
        }
    catch (err) {
        logger.error(err);
         throw err;
    }

}

module.exports = { test, uploadedConfirmation , testSync };
