import mongoose from "mongoose";
import env from "dotenv";

env.config();
const uri = process.env.MONGODB_URI;

const connectDB = () => {
  try {
    mongoose.connect(uri)
    .then(() => console.log("Connected to MongoDB"));
  } catch (err) {
    console.error('Could not connect to MongoDB', err);
    process.exit(1);
  }
};

export default connectDB;