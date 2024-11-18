import express from "express";
import createJob from "../controllers/job.mjs";

const router = express.Router();

router.post("/createJob",createJob);

export default router;