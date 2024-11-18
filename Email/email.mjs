import env from "dotenv";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import UserOTPVerification from "../modals/otp.mjs";
import sendOTPVerificationSMS from "../Mobile/sms.mjs";
import user from "../modals/user.mjs";

env.config();

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendOTPVerificationEmail = async ({ _id, email, phoneNumber }, res) => {
  try {
    const otp = generateOtp();
    const salt = await bcrypt.genSalt(10);

    //mail options
    const mailOptions = {
      from: `no-reply<${process.env.EMAIL}>`,
      to: email,
      subject: "Verify your email address",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Email</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #4CAF50;
            color: #ffffff;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 20px;
        }
        .otp {
            display: inline-block;
            background-color: #eaeaea;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 24px;
            letter-spacing: 4px;
            font-weight: bold;
            color: #333333;
        }
        .footer {
            background-color: #f1f1f1;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #777777;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://ci3.googleusercontent.com/meips/ADKq_NYaNMgUTCMhVRuT3z0R2yYn-9zO01HqqWpXPCcywvjjPHbbcI7d8hvbrjNFJWbHArRgPx1_1PiViW9G6uDc6LZwdlGtUzMTMmpcWAVMMWDBqb9TmIGSIi13STf4eY2Yi9s=s0-d-e1-ft#https://production-cuvette.s3.ap-south-1.amazonaws.com/cuvette+wordmark.png" alt="Cuvette Tech" width="150" class="CToWUd" data-bit="iit">
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>Use the following One-Time Password ${otp} to complete your email verification:</p>
            <div class="otp">${otp}</div>
            <p>This OTP is valid for 10 minutes. If you did not request this OTP, please ignore this email or contact support.</p>
            <p>Thank you,</p>
            <p>The Team</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`,
    };

    const newOTPVerification = new UserOTPVerification({
      userId: _id,
      emailOTP: await bcrypt.hash(otp.toString(), salt),
      mobileOTP: "000000",
      isVerified: false,
      status: "Pending",
      createdAt: new Date().getTime(),
      expiresAt: new Date().getTime() + 10 * 60 * 1000,
    });
    
    await sendOTPVerificationSMS("+91" + phoneNumber, newOTPVerification._id)
      .then(
        async () =>
          //save otp record
          await newOTPVerification.save().then(() =>
            user.findOneAndUpdate(
              { _id: _id },
              {
                companyEmail:email,
                emailVerificationStatus: "Generated",
                phoneNumberVerificationStatus: "Generated",
                otpId: newOTPVerification._id,
              }
            )
          )
      )
      .catch((err) => {
        console.error("Error saving OTP:", err.message); // Log the error
        throw new Error("Failed to save OTP");
      });
    await transporter.sendMail(mailOptions);
    return {
      status: "PENDING",
      message: "Verification otp email sent",
      data: {
        otpId: newOTPVerification._id,
        email,
      },
    };
  } catch (error) {
    return {
      status: "FAILED",
      message: error.message,
    };
  }
};

export default sendOTPVerificationEmail;
