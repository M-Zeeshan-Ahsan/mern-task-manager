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
router.get("/create", createTask);
router.get("/update", updateTask);
router.get("/delete", deleteTask);
router.get("/delete-multiple", deleteMultipleTask);

export default router;
