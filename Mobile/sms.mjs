import express from "express";
import twilio from "twilio";
import env from "dotenv";
import bcrypt from "bcrypt";
import UserOtpVerification from "../modals/otp.mjs";

env.config();

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
};

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = new twilio(accountSid, authToken);

const sendOTPVerificationSMS = async (phoneNumber, _id) => {
  const otp = generateOtp();
  const salt = await bcrypt.genSalt(10);

  if (!phoneNumber) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  client.messages
    .create({
      body: `
      Your OTP code is ${otp} 
This OTP is valid for 10 minutes. If you did not request this OTP, please ignore this SMS or contact support.

Thank you,

The Team`,
      from: twilioPhoneNumber,
      to: phoneNumber,
    })
    .then(async (message) => {
      console.log(`OTP sent: ${otp} (Message SID: ${message.sid})`);
      await UserOtpVerification.findOneAndUpdate(
        { _id: _id },
        {
          mobileOTP: await bcrypt.hash(otp.toString(), salt),
          phoneNumberVerificationStatus: "Generated",
        }
      );
    })
    .catch((error) => {
      console.error("Error sending OTP:", error);
    });
};

export default sendOTPVerificationSMS;
