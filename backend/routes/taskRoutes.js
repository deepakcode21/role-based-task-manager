import express from "express";
import { 
  createTask, 
  getTasks, 
  getTaskById, 
  updateTask, 
  updateTaskStatus, 
  deleteTask 
} from "../controllers/taskController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createTask);             // Create Task (Admin Only)

router.get("/", authMiddleware, getTasks);                      // Get All Tasks (Admin: All, Member: Assigned)

router.get("/:id", authMiddleware, getTaskById);                // Get Task by ID

router.put("/update/:id", authMiddleware, updateTask);                 // Update Task (Admin Only)

router.patch("/:id/status", authMiddleware, updateTaskStatus);  // Update Task Status (User Only)

router.delete("/delete/:id", authMiddleware, deleteTask);              // Delete Task (Admin Only)

export default router;
