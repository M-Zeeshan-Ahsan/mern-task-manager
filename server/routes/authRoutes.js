import express from "express";
import {
  userLogin,
  userRegistration,
  refreshToken,
} from "../controller/userController.js";

import validate from "../middleware/validate.js";
import asyncHandler from "../middleware/asyncHandler.js";

import {
  loginSchema,
  refreshTokenSchema,
  registrationSchema,
} from "../validation/userValidation.js";

import { rateLimit } from "express-rate-limit";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, try again later",
});

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Zeeshan
 *               email:
 *                 type: string
 *                 example: zeeshan@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  "/signup",
  validate(registrationSchema),
  asyncHandler(userRegistration),
);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Auth
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
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful with access and refresh token
 *       401:
 *         description: Invalid email or password
 */
router.post("/login", loginLimiter, validate(loginSchema), userLogin);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Generate new access token using refresh token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *     responses:
 *       200:
 *         description: New access token generated successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
  "/refresh-token",
  validate(refreshTokenSchema),
  asyncHandler(refreshToken),
);

export default router;
