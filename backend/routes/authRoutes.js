import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

//Admin can register (Only if no admin exists)
router.post("/admin/register", register);

// User signup (for normal users)
router.post("/user/signup", register);

//User login
router.post("/login", login);

export default router;
