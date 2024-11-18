import express from "express";
import {getUsers,createUser,verifyOTP,loginUser,authoriseLoginUser} from "../controllers/user.mjs";

const router = express.Router();

router.get("/getAllUsers", getUsers);
router.post("/createUser", createUser);
router.post("/loginUser", loginUser);
router.post("/loginUserAuth", authoriseLoginUser);
router.post("/verifyOTP", verifyOTP);

export default router;
