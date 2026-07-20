import express from "express";
import {
  createTask,
  deleteMultipleTask,
  deleteTask,
  getTasks,
  specificTask,
  updateTask,
} from "../controller/taskController.js";
import { userLogin, userRegistration } from "../controller/userController.js";

const router = express.Router();

router.post("/signup", userRegistration);
router.post("/login", userLogin);
router.get("/tasks", getTasks);
router.get("/task/:id", specificTask);
router.post("/create", createTask);
router.put("/update", updateTask);
router.delete("/delete", deleteTask);
router.delete("/delete-multiple", deleteMultipleTask);

export default router;
