// const nodemailer = require('nodemailer');
const axios = require("axios");

const logger = require("./logger");

// const transporter = nodemailer.createTransport({
//   host: 'smtp.example.com',
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_ID_FOR_OTP,
//     pass: process.env.EMAIL_ID_PASSWORD,
//   },
// });

const generateOtp = () => {
    logger.info();

    const newOtp = Math.floor(100000 + Math.random() * 900000);
    return newOtp.toString();
};

// const sendOtpViaEmail = async(email , otp)=>{
// const mailOptions = {
//   from: `"Merchant Portal" ${process.env.EMAIL_ID_FOR_OTP}`,
//   to: email,
//   subject: 'Verify Your Email for Merchant Portal',
//   text: `Hello Ekansh,

// Your OTP for email verification is: ${otp}

// This code will expire in 5 minutes.

// If you didn't request this, you can ignore the email.

// — Merchant Portal Team`,
// };

// await transporter.sendMail(mailOptions);
// }

const getApiName = (url, params) => {
    logger.info(url, params);

    let apiName = url.split("?")[0].split("/");
    const endpoint = apiName.slice(3, apiName.length).join("/");
    apiName = null;
    return convertApiNameRequest(endpoint, params);
};

const convertApiNameRequest = (apiName, params) => {
    // Iterate over the keys in the params object
    Object.keys(params).forEach((key) => {
        // Create a regular expression to match the value in the API string
        const regex = new RegExp(params[key], "g");
        // Replace the value in the API string with the key
        apiName = apiName.replace(regex, `:${key}`);
    });
    return apiName;
};

async function sendToGoogleChat(payload, url) {
    const message = payload;

    try {
        await axios.post(url, message);
        logger.info("Message sent to Google Chat successfully.");
    } catch (error) {
        logger.error("Error sending message to Google Chat:", error);
    }
}

function generateRandomId() {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function formatDateTime({
    date = new Date(),
    format = "{weekday} {month} {day} {hour}:{minute}:{second} IST {year}",
    locale = "en-US",
    options = {
        timeZone: "Asia/Kolkata",
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    },
} = {}) {
    const formatter = new Intl.DateTimeFormat(locale, options);
    const parts = formatter.formatToParts(date);
    const partMap = {};
    parts.forEach((p) => {
        partMap[p.type] = p.value;
    });
    return format.replace(/\{(\w+)\}/g, (_, key) => partMap[key] || "");
}

module.exports = {
    generateOtp,
    getApiName,
    sendToGoogleChat,
    generateRandomId,
    formatDateTime,
};
