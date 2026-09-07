const path = require("path");
const httpStatus = require("http-status");

const TIME_ZONE = "Asia/Calcutta";

const ERROR_MESSAGE = {
    EMAIL_ALREADY_IN_USE: "EMAIL_ALREADY_IN_USE",
    INVALID_EMAIL: "INVALID_EMAIL",
    INVALID_PASSWORD: "INVALID_PASSWORD",
    UNAUTHORIZED: "UNAUTHORIZED",
    INTERNAL_ERROR: "INTERNAL_ERROR",
    USER_NOT_ACTIVE: "USER_NOT_ACTIVE",
    EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
    EMAIL_VERIFICATION_FAILED: "EMAIL_VERIFICATION_FAILED",
    DB_CONNECTION_FAILED: "DB_CONNECTION_FAILED",
    WRONG_ACCESS_TYPE: "WRONG_ACCESS_TYPE",
    NOT_FOUND: "NOT_FOUND",
    SESSION_EXPIRED: "SESSION_EXPIRED",
    FLOW_ID_IN_USE: "FLOW_ID_IN_USE",
    QA_SERVICE_NOT_FOUND: "QA_SERVICE_NOT_FOUND",

};

const ERROR_RESPONSE = {
    EMAIL_ALREADY_IN_USE: {
        message: "Email already exist",
        statusCode: httpStatus.CONFLICT, //409
        errorCode: "ERR-101",
    },
    INVALID_PARAMS: {
        message: "Invalid params in Request",
        statusCode: httpStatus.BAD_REQUEST,
        errorCode: "ERR-202",
    },
    INVALID_EMAIL: {
        message: "Email does not exist",
        statusCode: httpStatus.UNAUTHORIZED,
        errorCode: "ERR-102",
    },
    INVALID_PASSWORD: {
        message: "Invalid password",
        statusCode: httpStatus.UNAUTHORIZED,
        errorCode: "ERR-103",
    },
    UNAUTHORIZED: {
        message: "Unauthorized access",
        statusCode: httpStatus.UNAUTHORIZED,
        errorCode: "ERR-104",
    },
    INTERNAL_ERROR: {
        message: "Something went wrong",
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        errorCode: "ERR-500",
    },
    USER_NOT_ACTIVE: {
        message: "User inactive. Kindly reach out to the admin for assistance.",
        statusCode: httpStatus.FORBIDDEN,
        errorCode: "ERR-105",
    },
    EMAIL_NOT_VERIFIED: {
        message: "Email not verified",
        statusCode: httpStatus.FORBIDDEN, // 403
        errorCode: "ERR-106",
    },
    EMAIL_VERIFICATION_FAILED: {
        message: "Email could not be verified",
        statusCode: httpStatus.BAD_REQUEST, // 500
        errorCode: "ERR-107",
    },
    WRONG_OTP: {
        message: "Otp entered is not valid",
        statusCode: httpStatus.UNAUTHORIZED, // 401
        errorCode: "ERR-108",
    },
    OTP_EXPIRED: {
        message: "Otp is Expired",
        statusCode: httpStatus.GONE, // 410
        errorCode: "ERR-109",
    },
    DB_CONNECTION_FAILED: {
        message: "Unable to connect with DB",
        statusCode: httpStatus.SERVICE_UNAVAILABLE,
        errorCode: "ERR-501",
    },
    WRONG_ACCESS_TYPE: {
        message: "Wrong request type should be in [READ , WRITE , DELETE]",
        statusCode: httpStatus.BAD_REQUEST,
        errorCode: "ERR-201",
    },
    NOT_FOUND: {
        message: "No data found for the given data",
        statusCode: httpStatus.NOT_FOUND,
        errorCode: "ERR-110",
    },
    SESSION_EXPIRED: {
        message: "Session Expired Please login Again",
        statusCode: httpStatus.BAD_REQUEST,
        errorCode: "ERR-111",
    },
    FLOW_ID_IN_USE: {
        message: "FlowId currently in use please try later or use another flowId",
        statusCode: httpStatus.BAD_REQUEST,
        errorCode: "ERR-111"
    },
    QA_SERVICE_NOT_FOUND: {
        message: "No QA flows are mapped to the given serviceName",
        statusCode: httpStatus.NOT_FOUND,
        errorCode: "ERR-112",
    },
};

const ENVIRONMENT = {
    PROD: "prod",
    STAGING: "staging",
    QA: "QA",
    DEV: "DEV",
};

const LOGGER = Object.freeze({
    FILE: {
        dirname: "logs", // Specify the directory where log files will be stored
        filename: "MP-backend__%DATE%.log", // Define the log file name pattern
        datePattern: "YYYY-MM-DD", // Set the date pattern for creating new log files
        zippedArchive: true, // Compress the archived log files
        maxSize: "2gb", // Set the maximum size of each log file
        createSymlink: false, // This config only works in linux
        symlinkName: "MP-backend.log",
    },
    CONSOLE: {
        level: "debug",
        handleExceptions: true,
        json: false,
        colorize: true,
        timestamp: true,
    },
});

const DB = Object.freeze({
    config: {
        maxRetries: 5,
        retryDelay: 5000,
    },
});

const SUCCESS_MESSAGE = {
    USER_CREATED: "User account created successfully.",
    USER_LOGGEDIN: "User logged in successfully.",
    OTP_SENT: "OTP has been sent successfully.",
    USER_UPDATED: "User information updated successfully.",
    API_ADDED: "API successfully added to the resource.",
    RESOURCE_ADDED: "Resource added successfully.",
    ROLE_MAPPED: "Role mapped to the resource successfully.",
    HIERARCHY_ADDED: "Hierarchy established successfully.",
    FETCHED_SUCCESSFULLY: "Data retrieved successfully.",
    USER_SIGN_OUT: "User sign out successfully.",
    POLICY_UPDATED: "Policy is updated successfully.",
    POLICY_DELETED: "Policy is deleted successfully.",
    PROCESSING: "Your file is being processed. You can download it later from the Download History.",
    TRANSACTION_CREATED_SUCCESSFULLY: "Transaction created successfully.",
    ROLE_ADDED: "New role added",
    OK: "OK",
    SUBSCRIBED: " Subscribed Successfully",
    UNSUBSCRIBED: "UnSubscribed Successfully",
    ALREADY_SUBSCRIBED: " already Subscribed",
    SERVICE_ADDED: "Service added",
    SERVICES_DELETED: "Service deleted",
    MESSAGE_PUSHED: "Message Pushed",
    SQS_UPDATED: "SQS monitoring has been updated. The changes will be reflected shortly.",
    FLOW_UPDATED: "Flow updated successfully.",
    FLOW_CREATED: "Flow ctreated successfully.",
    TEST_SYNC_COMPLETED: "Test execution completed successfully. par shruti se slow hu 🥲",
    QA_SERVICE_TRIGGERED: "QA flows for the service have been triggered.",
};

const USER = {
    STATUS: { BLOCKED: "BLOCKED", ACTIVE: "ACTIVE", PENDING: "PENDING" },
};

const ROLES = {
    ADMIN: "admin",
    DEFAULT: "default",
};

const MAX_RETRY_ATTEMPTS = 3;

const ACCESS_TYPE = {
    READ: "read",
    WRITE: "write",
    DELETE: "delete",
};

const REQUEST_TYPE = {
    GET: "GET",
    PUT: "PUT",
    POST: "POST",
    PATCH: "PATCH",
    DELETE: "DELETE",
};

const JWT_KEYS = {
    PATH: {
        PRIVATE_KEY: path.join(__dirname, "./keys/rsa.key"),
        PUBLIC_KEY: path.join(__dirname, "./keys/rsa.key.pub"),
    },
};

const ACCESS_TOKEN = {
    ISSUER: "MP",
    ALGORITHM: "RS256",
    EXPIRY: "15m",
    NAME: "accessToken",
};

const REFRESH_TOKEN = {
    ISSUER: "MP",
    ALGORITHM: "RS256",
    EXPIRY: "7d",
    NAME: "refreshToken",
};

const PTYPE = {
    P: "p",
    G: "g",
    G2: "g2",
    G3: "g3",
};

const DOWNLOAD_HISTORY_STATUS = {
    COMPLETED: "COMPLETED",
    IN_PROGRESS: "IN PROGRESS",
    FAILED: "FAILED",
};

const ALERTS = {
    xyz: "xyz",
};

const QA_SERVICE_STATUS = {
    SUCCESS: "SUCCESS",
    PARTIAL_SUCCESS: "PARTIAL_SUCCESS",
    FAILED: "FAILED",
};

const QA_SERVICE_FLOW_STATUS = {
    TRIGGERED: "TRIGGERED",
    FAILED: "FAILED",
};

const QA_TESTING_HEADERS = {
    ID: "Test Case ID",
    SCENARIO: "Test Case Scenario",
    METHOD: "method",
    URL: "URL",
    HEADERS: "headers",
    PAYLOAD: "payload",
    EXPECTED_RESULT: "expected_results",
};

const PA_ENDPOINTS = {
    QA: {
        CREATE_TRANSACTION: "http://10.220.21.159:8022/publishsqs",
    },
    STAGING: {
        CREATE_TRANSACTION: "http://10.220.21.159:8022/publishsqs",
    },
};

const PA_RESOURCES = {
    QA: {
        SQS: {
            TRANSACTION: "https://sqs.ap-south-1.amazonaws.com/364871072205/spg_payO_upi_notification_qa",
        },
    },
    STAGING: {
        SQS: {
            TRANSACTION: "https://sqs.ap-south-1.amazonaws.com/364871072205/spg_payO_upi_notification_staging",
        },
    },
};

const SERVICES = {
    EIL: "EIL",
};

const QA_TEST_LOCK_PADDING = 1000;

const BATCH_SIZE = 10;

const QA_FILE_HEADERS = ["Testcase id", "description", "url", "method", "headers", "params", "body", "expectedOutput", "dbQueries", "delay", "apiResponse", "output"];

const MOB_NOTIFICATIONS = {
    ONBOARDING_STATUS: {
        type: "ONBOARDING_STATUS",
        data: {
            sequence: 1,
            partnerId: "MERf34dc34",
            referenceId: "leadId",
            intentId: "INTrd34rd34",
            statusCode: "SPG-0000",
            statusMessage: "SUCCESS",
            entityCode: "MER2ed23ed3",
            perTransactionLimit: 10,
            dailyTransactionLimit: 100,
            monthlyTransactionLimit: 1000,
        },
    },
    CAF_GENERATION: {
        type: "CAF_GENERATION",
        data: {
            sequence: 2,
            partnerId: "MERf34dc34",
            referenceId: "leadId",
            intentId: "INTrd34rd34",
            statusCode: "SPG-0000",
            statusMessage: "SUCCESS",
            presignedUrl: "",
        },
    },
    CAF_CONSENT: {
        type: "CAF_CONSENT",
        data: {
            sequence: 3,
            partnerId: "MERf34dc34",
            referenceId: "leadId",
            intentId: "INTrd34rd34",
            statusCode: "SPG-0000",
            statusMessage: "SUCCESS",
            remarks: "some remarks",
        },
    },
    CHECKER_REJECTION: {
        type: "CHECKER_REJECTION",
        data: {
            sequence: 4,
            partnerId: "MERf34dc34",
            referenceId: "leadId",
            intentId: "INTrd34rd34",
            statusCode: "SPG-0000",
            statusMessage: "SUCCESS",
            remarks: "remarks",
            fields: [
                {
                    key: "turnoverAmount",
                    remarks: "Not Valid",
                },
                {
                    key: "companyAge",
                    remarks: "Not Valid",
                },
            ],
        },
    },
};

const MOB_SQS = {
    staging: "https://sqs.ap-south-1.amazonaws.com/259209043622/mob_pa_onboard_entity_notification_sqs"
    // staging : "https://sqs.ap-southeast-2.amazonaws.com/962214556710/myqueue"
}


const TXN = {
    ORCHESTRATOR_URL:
        "https://merchanteventorchestrator-staging.fcinternal.in/dev/sqs/transaction",
    MASTER_KEY: "EYOP14DA5",
    TOPIC_ARN: "arn:aws:sns:ap-south-1:364871072205:fcpg_outbound_notification_sns_qa",
    SIGNING_CERT_URL:
        "https://sns.ap-south-1.amazonaws.com/SimpleNotificationService-9c6465fa7f48f5cacd23014631ec1136.pem",
    UNSUBSCRIBE_URL:
        "https://sns.ap-south-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:ap-south-1:364871072205:fcpg_outbound_notification_sns_qa:808a0ae4-7772-4e78-a85a-ed2ec0b2b45e",
};

const EIL_STARTING_DATE = "2023-10-10 00:00:00";

module.exports = {
    TIME_ZONE,
    ERROR_MESSAGE,
    ERROR_RESPONSE,
    ENVIRONMENT,
    LOGGER,
    DB,
    USER,
    SUCCESS_MESSAGE,
    MAX_RETRY_ATTEMPTS,
    JWT_KEYS,
    REQUEST_TYPE,
    ACCESS_TYPE,
    REFRESH_TOKEN,
    ACCESS_TOKEN,
    ROLES,
    PTYPE,
    DOWNLOAD_HISTORY_STATUS,
    ALERTS,
    BATCH_SIZE,
    PA_ENDPOINTS,
    PA_RESOURCES,
    SERVICES,
    QA_TEST_LOCK_PADDING,
    QA_FILE_HEADERS,
    MOB_NOTIFICATIONS,
    MOB_SQS,
    TXN,
    EIL_STARTING_DATE,
    QA_SERVICE_STATUS,
    QA_SERVICE_FLOW_STATUS
};
