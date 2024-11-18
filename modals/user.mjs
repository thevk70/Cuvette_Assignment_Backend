import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    require: true,
  },
  companyEmail: {
    type: String,
    require: true,
    unique: true,
  },
  employeeSize: {
    type: Number,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmPassword: {
    type: String,
    required: true,
  },
  emailVerificationStatus: {
    type: String,
    default: "Pending",
  },
  phoneNumberVerificationStatus: {
    type: String,
    default: "Pending",
  },
  otpId: {
    type: String,
    default: "000000",
  },
});

export default mongoose.model("user", userSchema);
