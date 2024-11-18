import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  mobileOTP: {
    type: String,
  },
  emailOTP: {
    type: String,
  },
  status: {
    type: String,
    required: true,
  },
  isVerfied: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: Date,
  expiresAt: Date,
});

export default mongoose.model("UserOTPVerification", otpSchema);
