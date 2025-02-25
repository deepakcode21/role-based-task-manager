import mongoose from "mongoose";
import Task from "../models/Task.js";
import User from "../models/User.js";

export const createTask = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { title, description, assignedTo, deadline } = req.body;

    // Convert assignedTo ID to ObjectId
    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    // Ensure User Exists Before Assigning
    const userExists = await User.findById(assignedTo);
    if (!userExists) {
      return res.status(400).json({ message: "Assigned user not found!" });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo: new mongoose.Types.ObjectId(assignedTo),  //Convert to ObjectId
      deadline,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Task Creation Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// 2. Get Tasks (Admin: All Tasks, User: Only Assigned Tasks)
export const getTasks = async (req, res) => {
    try {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1)); // Monday
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
        endOfWeek.setHours(23, 59, 59, 999);

        let query = { deadline: { $gte: startOfWeek, $lte: endOfWeek } }; // Filter by this week's tasks

        if (req.user.role !== "admin") {
            query.assignedTo = req.user.id; // Users should only see their own assigned tasks
        }

        const tasks = await Task.find(query).populate("assignedTo", "name email");

        // Group tasks by days of the week
        const tasksByDay = {
            Monday: [], Tuesday: [], Wednesday: [], Thursday: [],
            Friday: [], Saturday: [], Sunday: []
        };

        tasks.forEach(task => {
            const dayName = new Date(task.deadline).toLocaleString('en-US', { weekday: 'long' });
            tasksByDay[dayName].push(task);
        });

        res.json(tasksByDay);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

  

// 3. Get Single Task by ID
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("assignedTo", "name email");
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Users can only access their own tasks
    if (req.user.role !== "admin" && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 4. Update Task (Only Admin)
export const updateTask = async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

  const { title, description, assignedTo, deadline, status } = req.body;

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.title = title || task.title;
    task.description = description || task.description;
    task.assignedTo = assignedTo || task.assignedTo;
    task.deadline = deadline || task.deadline;
    task.status = status || task.status;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 5. User Can Update Only Task Status (Pending → Working → Completed)
export const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    //Check if the logged-in user is the assigned user
    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only update your assigned tasks" });
    }

    const { status } = req.body;
    const allowedStatuses = ["pending", "working", "completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status update" });
    }

    task.status = status;
    const updatedTask = await task.save();

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

//6. Delete Task (Only Admin)
export const deleteTask = async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
