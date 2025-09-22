import env from "dotenv";
import nodemailer from "nodemailer";
import { validateEmail } from "../common/Validation.mjs";
env.config();

function formatDate(date) {
  const options = {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  const dateTimeFormatter = new Intl.DateTimeFormat("en-US", options);

  const parts = dateTimeFormatter.formatToParts(date);
  const day = parts.find((part) => part.type === "day").value;
  const month = parts.find((part) => part.type === "month").value;
  const weekday = parts.find((part) => part.type === "weekday").value;
  const hour = parts.find((part) => part.type === "hour").value;
  const minute = parts.find((part) => part.type === "minute").value;
  const dayPeriod = parts.find((part) => part.type === "dayPeriod").value;

  // Add ordinal suffix to the day
  const suffix =
    day === "1" || day === "21" || day === "31"
      ? "st"
      : day === "2" || day === "22"
      ? "nd"
      : day === "3" || day === "23"
      ? "rd"
      : "th";

  return `${hour}:${minute}${dayPeriod}, ${day}${suffix} ${month} (${weekday})`;
}

const createEmailBody = (job) => {
  return `
      <!DOCTYPE html>
<html>
<head>
  <style>
    body,html {
      font-family: Arial, sans-serif;
      color: #333;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      padding: 20px;
      border: 1px solid #dddddd;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      padding-bottom: 20px;
      color: #4CAF50;
      font-size: 24px;
      font-weight: bold;
    }
    .header-img{
      text-align: center;
      background-color: #4CAF50;
      padding: 5px;
      border-radius: 4px;
    }
    .content {
      font-size: 16px;
      color: #555555;
    }
    .content p {
      margin: 0 0 15px;
    }
    .details {
      font-weight: bold;
      color: #333;
      margin: 15px 0;
    }
    .link {
      color: #4CAF50;
      text-decoration: none;
    }
    .footer {
      font-size: 14px;
      color: #888888;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-img">
            <img src="https://ci3.googleusercontent.com/meips/ADKq_NYaNMgUTCMhVRuT3z0R2yYn-9zO01HqqWpXPCcywvjjPHbbcI7d8hvbrjNFJWbHArRgPx1_1PiViW9G6uDc6LZwdlGtUzMTMmpcWAVMMWDBqb9TmIGSIi13STf4eY2Yi9s=s0-d-e1-ft#https://production-cuvette.s3.ap-south-1.amazonaws.com/cuvette+wordmark.png" alt="Cuvette Tech" width="150" class="CToWUd" data-bit="iit">
        </div>
        <br>
    <div class="header">Greetings!</div>
    <div class="content">
      <p>We are excited to inform you that <strong>Cuvette</strong> is hiring for a <strong>Full-Time ${
        job.location
      } ${job.title}</strong> position with a competitive salary of <strong>${
    job.salary
  } LPA</strong>.</p>
      <div class="details">
        <p>Key Details:</p>
        <ul>
          <li><strong>Role:</strong> ${job.title}</li>
          <li><strong>Description:</strong> ${job.description}</li>
          <li><strong>Salary:</strong> ${job.salary} LPA</li>
          <li><strong>Experience-Level:</strong> ${job.experienceLevel}</li>
          <li><strong>Location:</strong> ${job.location}</li>
          <li><strong>Submission Deadline:</strong> ${formatDate(
            job.endDate
          )}</li>
        </ul>
      </div>
      <p>Please review the instructions carefully and ensure timely submission of your resume. If you have any questions, feel free to contact us at <a href="mailto:thevk70@gmail.com" class="link">thevk70@gmail.com</a>.</p>
      <p>We look forward to receiving your application and wish you the best of luck!</p>
    </div>
    <div class="footer">
      Best regards,<br>
      Cuvette Team
    </div>
  </div>
</body>
</html>

    `;
};

const sendJobEmail = async (jobData) => {
  const htmlBody = createEmailBody(jobData);

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

  try {
    // Iterate over the candidate emails and send the email
    const emails = jobData.addCandidates;

    for (let i = 0; i < emails.length; i++) {
      if (validateEmail(emails[i])) {
        await transporter.sendMail({
          from: `"Job Notification" <${process.env.EMAIL_USER}>`,
          to: emails[i],
          subject: `New Job Opportunity: ${jobData.title}`,
          html: htmlBody,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to send emails", error,type:"error" });
  }
};

export default sendJobEmail;
