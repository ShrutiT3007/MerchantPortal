const constants = require("../../constants");

const successResponse = (message = "Ok", data = null) => {
    return {
        result: {
            data,
            message,
        },
        error: null,
    };
};

const errorResponse = ({ errorCode = "ERR-500", message = constants.ERROR_MESSAGE.INTERNAL_ERROR }) => {
    return {
        result: null,
        error: {
            errorCode,
            message,
        },
    };
};

module.exports = { successResponse, errorResponse };
