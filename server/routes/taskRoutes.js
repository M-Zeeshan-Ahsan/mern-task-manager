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
import upload from "../middleware/upload.js";
import { uploadImage } from "../controller/uploadController.js";

const router = express.Router();

router.post("/signup", userRegistration);
router.post("/login", userLogin);
router.get("/tasks", getTasks);
router.get("/task/:id", specificTask);
router.post("/upload", upload.single("image"), uploadImage);
router.post("/create", createTask);
router.put("/update", updateTask);
router.delete("/delete/:id", deleteTask);
router.delete("/delete-multiple", deleteMultipleTask);

export default router;
