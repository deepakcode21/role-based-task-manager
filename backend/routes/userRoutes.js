import express from "express";
import { getUsers, getUserById, deleteUser } from "../controllers/userController.js";
import { createUser } from "../controllers/authController.js"; 
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-user", authMiddleware, createUser);           // Admin can create a user

router.get("/all-user", authMiddleware, getUsers);              // Admin can get all users

router.get("/user/:id", authMiddleware, getUserById);        // Get user by ID

router.delete("/delete/:id", authMiddleware, deleteUser);      // Admin can delete user

export default router;
