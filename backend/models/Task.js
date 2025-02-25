import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deadline: { type: Date, required: true },
  status: { type: String, enum: ["pending", "completed"], default: "pending" }
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);
