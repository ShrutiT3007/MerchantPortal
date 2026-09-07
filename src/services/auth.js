const argon = require("argon2");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const logger = require("../utils/logger");
const userService = require("./user");
const constants = require("../../constants");
const userRoleService = require("./userRoles");

const signUp = async (details) => {
    logger.info();

    const isEmailExist = await userService.findUserByEmail(details);

    if (isEmailExist) throw new Error(constants.ERROR_MESSAGE.EMAIL_ALREADY_IN_USE);

    details.hashedPassword = await argon.hash(details.password);

    return userService.addUser(details);
};

const signIn = async (details) => {
    logger.info();

    const user = await userService.findUserByEmail(details);

    if (!user) throw new Error(constants.ERROR_MESSAGE.INVALID_EMAIL);

    const { hashedPassword, ...userData } = user.dataValues;

    if (!(await argon.verify(hashedPassword, details.password))) {
        throw new Error(constants.ERROR_MESSAGE.INVALID_PASSWORD);
    } else if (userData.status !== constants.USER.STATUS.ACTIVE) {
        throw new Error(constants.ERROR_MESSAGE.USER_NOT_ACTIVE);
    }

    const roleData = await userRoleService.getUserRoles((filter = { userId: userData.id }));
    const issuedDate = new Date().toISOString();
    let publicKey , privateKey;
            try{
                publicKey = fs.readFileSync(constants.JWT_KEYS.PATH.PUBLIC_KEY, "utf8");
                privateKey = fs.readFileSync(constants.JWT_KEYS.PATH.PRIVATE_KEY, "utf8");
            }
            catch(err){
                publicKey = process.env["rsa.key.pub"];
                privateKey = process.env["rsa.key"];
            }
    const accessToken = jwt.sign(
        {
            issuer: constants.ACCESS_TOKEN.ISSUER, //constant
            userId: userData.id,
            role: roleData,
            issuedAt: issuedDate,
            type: constants.ACCESS_TOKEN.NAME,
        },
        privateKey,
        { algorithm: constants.ACCESS_TOKEN.ALGORITHM, expiresIn: constants.ACCESS_TOKEN.EXPIRY }
    );
    const refreshToken = jwt.sign(
        {
            issuer: constants.REFRESH_TOKEN.ISSUER,
            userId: userData.id,
            role: roleData,
            issuedAt: issuedDate,
            type: constants.REFRESH_TOKEN.NAME,
        },
        privateKey,
        { algorithm: constants.REFRESH_TOKEN.ALGORITHM, expiresIn: constants.REFRESH_TOKEN.EXPIRY }
    );

    return { accessToken, refreshToken, userData, roleData };
};

// const sendEmailVerficationOtp = async ({email})=>{
//   logger.info();

//   const user = await  UserModel.findUserByEmail(email);

//   if(!user){
//     throw new AppError(constants.ERRORS_MESSAGE.INVALID_EMAIL ,httpStatus.UNAUTHORIZED);
//   }

//   const newOtp = process.env.ENVIRONMENT === constants.ENVIRONMENT.DEV ? "000000" :commonUtil.generateOtp();
//   const hashedOTP = await argon.hash(newOtp);

//   const isEntryCreated  = await  emailVerificationModel.findEntry({userId:user.id});
//   let attemptsLeft = constants.MAX_RETRY_ATTEMPTS;
//   if(!isEntryCreated){

//       const details = {
//       userId : user.id,
//       hashedOTP : hashedOTP,
//       attempts : 1,
//     }
//     await emailVerificationModel.createEntry(details);
//     attemptsLeft--;
//   }
//   else if( isEntryCreated.attempts<=constants.MAX_RETRY_ATTEMPTS){
//       const details = {
//       hashedOTP : hashedOTP,
//       attempts: isEntryCreated.attempts+1
//       }
//       await emailVerificationModel.updateEntry(details , {id:isEntryCreated.id});
//       attemptsLeft = attemptsLeft - isEntryCreated.attempts -1;
//   }
//   else{
//     await emailVerificationModel.deleteEntry({id:isEntryCreated.id});
//     await UserModel.deleteUser({id:user.id});
//     throw new AppError(constants.ERRORS_MESSAGE.EMAIL_VERIFICATION_FAILED , httpStatus.BAD_REQUEST);
//   }
//   // await commonUtil.sendOtpViaEmail(user.email , newOtp);
//   return { userId : user.id , attemtsLeft:attemptsLeft};
// }

// const verifyEmail = async({otp , userId})=>{
//   logger.info();

//   const emailEntry = await emailVerificationModel.findEntry({userId});
//   const currentTime = moment();

//     if(currentTime.isAfter(moment(emailEntry.updatedAt).add(5,'minutes'))){
//       throw new AppError(constants.ERRORS_MESSAGE.OTP_EXPIRED , httpStatus.BAD_REQUEST);
//     }
//     else if(await argon.verify(emailEntry.hashedOTP , otp)){
//       await UserModel.updateUser({isEmailVerified:1 , status:constants.USER.STATUS.ACTIVE}, {id:userId});
//     }
//     else{
//       throw new AppError(constants.ERRORS_MESSAGE.WRONG_OTP, httpStatus.BAD_REQUEST);
//     }
// }

module.exports = {
    signUp,
    signIn,
};
