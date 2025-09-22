import User from "../modals/user.mjs";
import sendOTPVerificationEmail from "../Email/email.mjs";
import otp from "../modals/otp.mjs";
import env from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
import {
  validateEmail,
  validatePassword,
  validatePhoneNo,
  validateOTP,
} from "../common/Validation.mjs";

env.config();
const salt = await bcrypt.genSalt(10);

const getUsers = async (req, res) => {
  try {
    const users = await User.find().exec(); // Find all users in the database
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", type: "error" });
  }
};

const createUser = async (req, res) => {
  const {
    name,
    companyEmail,
    employeeSize,
    companyName,
    phoneNumber,
    password,
    confirmPassword,
  } = req.body;
  let otpResponse;

  if (!validateEmail(req.body.companyEmail)) {
    return res.status(203).json({
      message: "Please enter a valid email address.",
      type: "warning",
    });
  }

  if (!validatePassword(req.body.password)) {
    return res.status(203).json({
      message:
        "Password must be at least 8 characters long and include uppercase letters, lowercase letters, digits, and special characters.",
      type: "warning",
    });
  }

  if (!validatePhoneNo(req.body.phoneNumber)) {
    return res.status(203).json({
      message: "Please enter a valid 10-digit phone number.",
      type: "warning",
    });
  }

  if (!name || !companyEmail || !password || !confirmPassword) {
    return res
      .status(203)
      .json({ message: "All fields are required.", type: "warning" });
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return res
      .status(203)
      .json({ message: "Passwords do not match.", type: "warning" });
  }

  try {
    // Check if companyEmail is unique
    const existingUser = await User.findOne({ companyEmail });
    if (existingUser) {
      return res
        .status(203)
        .json({ message: "Email already exists.", type: "warning" });
    }

    // Create new user
    const newUser = new User({
      name,
      companyEmail,
      companyName,
      employeeSize,
      phoneNumber,
      password: await bcrypt.hash(req.body.password, salt),
      confirmPassword: await bcrypt.hash(req.body.confirmPassword, salt),
    });

    // Save user to DB
    await newUser.save().then(async () => {
      otpResponse = await sendOTPVerificationEmail({
        _id: newUser._id,
        email: newUser.companyEmail,
        phoneNumber: newUser.phoneNumber,
      });
    });
    setTimeout(async () => {
      await User.deleteOne({
        companyEmail: companyEmail,
        emailVerificationStatus: "Generated",
        phoneNumberVerificationStatus: "Generated",
      });
    }, 600000);
    res.status(201).json({ message: "OTP Sent", otpResponse });
  } catch (error) {
    res.status(500).json({ message: "Server error", type: "error" });
  }
};

const verifyOTP = async (req, res) => {
  const { mobileOTP, emailOTP, otpId } = req.body;
  const Check = validateOTP(mobileOTP) && validateOTP(emailOTP);
  if (Check) {
    const otpResult = await otp.find({ _id: otpId });
    if (otpResult.length > 0) {
      const now = new Date().getTime();
      const expireAt = otpResult[0].expiresAt;
      if (now <= expireAt) {
        let Check = await bcrypt.compare(
          mobileOTP.toString(),
          otpResult[0].mobileOTP
        );
        if (Check) {
          Check = await bcrypt.compare(emailOTP, otpResult[0].emailOTP);
          if (Check) {
            await User.findOneAndUpdate(
              { _id: otpResult[0].userId },
              {
                emailVerificationStatus: "Verified",
                phoneNumberVerificationStatus: "Verified",
              }
            ).then(async () => {
              await otp.findOneAndUpdate(
                { _id: otpId },
                {
                  status: "Success",
                  isVerified: "true",
                }
              );
              res.status(200).json({
                message: "OTP verified successfully",
                type: "success",
              });
            });
          } else {
            res
              .status(203)
              .json({ message: "Invalid Email OTP", type: "warning" });
          }
        } else {
          res
            .status(203)
            .json({ message: "Invalid Mobile OTP", type: "warning" });
        }
      } else {
        return res
          .status(203)
          .json({ message: "OTP has expired", type: "error" });
      }
    } else {
      res.status(203).json({
        message: "Something went wrong OTP not generated.",
        type: "error",
      });
    }
  } else {
    res
      .status(203)
      .json({ message: "Please enter six digit OTP", type: "warning" });
  }
};

const loginUser = async (req, res) => {
  const { companyEmail, password } = req.body;

  if (!validateEmail(companyEmail)) {
    return res.status(203).json({
      message: "Please enter a valid email address.",
      type: "warning",
    });
  }

  if (!validatePassword(password)) {
    return res.status(203).json({
      message:
        "Password must be at least 8 characters long and include uppercase letters, lowercase letters, digits, and special characters.",
      type: "warning",
    });
  }
  const user = await User.find({ companyEmail });
  if (user) {
    if (!validatePassword(req.body.password)) {
      return res.status(203).json({
        message:
          "Password must be at least 8 characters long and include uppercase letters, lowercase letters, digits, and special characters.",
        type: "warning",
      });
    }

    const isMatch = await bcrypt.compare(password, user[0].password);
    if (isMatch) {
      const tokenString = jwt.sign(
        { _id: user[0]._id.toString(), email: user[0].companyEmail },
        process.env.SECRET_KEY,
        { expiresIn: "5m" }
      );
      const options = {
        expires: new Date(Date.now() + 5 * 60 * 1000),
        httpOnly: true,
      };
      res.status(200).cookie("token", tokenString, options).json({
        message: "Logged in successfully",
        token: tokenString,
        type: "success",
      });
    } else {
      res.status(203).json({ message: "Incorrect Password.", type: "error" });
    }
  } else {
    res.status(203).json({ message: "Invalid Email.", type: "error"  });
  }
};

const authoriseLoginUser = async (req, res) => {
  const token = req.cookies.token;
  if (token) {
    const user = jwtDecode(token);
    res.status(200).json({ message: "Welcome", type: "success" });
  } else {
    res.status(203).json({ message: "Token Expired", type: "error" });
  }
};

const resetPassword = async (req, res) => {
  const { email, password, confirmPassword } = req.body;
};
export {
  getUsers,
  createUser,
  loginUser,
  authoriseLoginUser,
  resetPassword,
  verifyOTP,
};
