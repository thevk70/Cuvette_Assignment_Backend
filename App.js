import express from "express";
import connectDB from "./database/connect.mjs";
import env from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import user_routes from "./routes/user.mjs";
import jobpost_routes from "./routes/job.mjs";
env.config();
const port = process.env.PORT;
const app = express();

//Handling CORs Errors
app.use(cors());

// Built-in middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/user", user_routes);
app.use("/job", jobpost_routes);

const start = async () => {
  try {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
    await connectDB();
  } catch (error) {
    console.error(error);
    const port = process.env.PORT;
  }
};

start();
