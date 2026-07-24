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
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post("/signup", userRegistration);
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: zeeshan@gmail.com
 *               password:
 *                 type: string
 *                 example: 12345
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Email and password are required
 *       401:
 *         description: Invalid email or password
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post("/login", userLogin);
/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of tasks per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or description
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tasks fetched successfully
 *       500:
 *         description: Internal server error
 */

router.get("/tasks", verifyToken, getTasks);
/**
 * @swagger
 * /task/{id}:
 *   get:
 *     summary: Get task by id
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *  security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task fetched successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.get("/task/:id", verifyToken, specificTask);
/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload image to AWS S3
 *     tags:
 *       - Upload
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: Please select an image
 *       500:
 *         description: Image upload failed
 */

router.post("/upload", upload.single("image"), uploadImage);
/**
 * @swagger
 * /create:
 *   post:
 *     summary: Create a new task
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: string
 *               description:
 *                 type: string
 *                 example: string
 *               image:
 *                 type: string
 *                 example: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */

router.post("/create", verifyToken, createTask);
/**
 * @swagger
 * /update:
 *   put:
 *     summary: update a existing task
 *     tags:
 *       - Tasks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - _id
 *               - title
 *               - description
 *             properties:
 *               _id:
 *                 type: string
 *                 example: string
 *               title:
 *                 type: string
 *                 example: string
 *               description:
 *                 type: string
 *                 example: string
 *               image:
 *                 type: string
 *                 example: string
 *  security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.put("/update", verifyToken, updateTask);
/**
 * @swagger
 * /delete/{id}:
 *   delete:
 *     summary: Delete a task by id
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       400:
 *         description: Task id is required
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.delete("/delete/:id", verifyToken, deleteTask);
/**
 * @swagger
 * /delete-multiple:
 *   delete:
 *     summary: Delete multiple tasks
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - "6870d6a8f5a8d0d5b2d8f123"
 *                   - "6870d6a8f5a8d0d5b2d8f456"
 *     responses:
 *       200:
 *         description: Tasks deleted successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.delete("/delete-multiple", verifyToken, deleteMultipleTask);

export default router;
