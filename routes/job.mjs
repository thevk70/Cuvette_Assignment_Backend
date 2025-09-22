import express from "express";
import createJob from "../controllers/job.mjs";
import authenticateToken from "../authentication/userAuth.mjs";

const router = express.Router();

router.post("/createJob",authenticateToken, createJob);

export default router;