import { ObjectId } from "mongodb";
import { collectionName, connection } from "../dbconfig.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  registrationSchema,
  loginSchema,
} from "../validation/userValidation.js";
import ApiError from "../middleware/ApiError.js";

export const userRegistration = async (req, res, next) => {
  const { name, email, password } = req.body;
  const db = await connection();
  const collection = await db.collection("users");
  const existingUser = await collection.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "Email already exists");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    name,
    email,
    password: hashedPassword,
    createdAt: new Date(),
  };
  const result = await collection.insertOne(user);
  if (result.insertedId) {
    return res.status(201).json({
      success: true,
      message: "user created successfully",
      data: result,
    });
  }
  throw new ApiError(400, "User not created");
};

export const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const db = await connection();
    const collection = db.collection("users");
    const user = await collection.findOne({ email });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(404, "Invalid email or password");
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2d",
      },
    );

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token,
      data: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};
