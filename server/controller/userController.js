import { ObjectId } from "mongodb";
import { collectionName, connection } from "../dbconfig.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  registrationSchema,
  loginSchema,
} from "../validation/userValidation.js";

export const userRegistration = async (req, res, next) => {
  try {
    registrationSchema.parse(req.body);
    const { name, email, password } = req.body;
    const db = await connection();
    const collection = await db.collection("users");
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
        data: null,
      });
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

    return res.status(400).json({
      success: false,
      message: "user not created",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const userLogin = async (req, res, next) => {
  try {
    loginSchema.parse(req.body);
    const { email, password } = req.body;

    const db = await connection();
    const collection = db.collection("users");
    const user = await collection.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        data: null,
      });
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
