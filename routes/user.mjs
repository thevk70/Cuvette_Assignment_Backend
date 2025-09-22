import express from "express";
import {getUsers,createUser,verifyOTP,loginUser,authoriseLoginUser} from "../controllers/user.mjs";
import authenticateToken from "../authentication/userAuth.mjs";

const router = express.Router();

router.get("/getAllUsers", getUsers);
router.post("/createUser", createUser);
router.post("/loginUser", loginUser);
router.post("/loginUserAuth",authenticateToken, authoriseLoginUser);
router.post("/verifyOTP", verifyOTP);

export default router;
