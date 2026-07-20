import express from "express";
import {
  createTask,
  deleteMultipleTask,
  deleteTask,
  getTasks,
  specificTask,
  updateTask,
} from "../controller/taskController.js";

const router = express.Router();

router.get("/tasks", getTasks);
router.get("/task/:id", specificTask);
router.post("/create", createTask);
router.put("/update", updateTask);
router.delete("/delete", deleteTask);
router.delete("/delete-multiple", deleteMultipleTask);

export default router;
