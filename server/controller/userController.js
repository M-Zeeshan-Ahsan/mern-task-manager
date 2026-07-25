import { ObjectId } from "mongodb";
import { collectionName, connection } from "../dbconfig.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  registrationSchema,
  loginSchema,
} from "../validation/userValidation.js";
import ApiError from "../middleware/ApiError.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

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

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await collection.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          refreshToken,
        },
      },
    );
    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      accessToken,
      refreshToken,
      data: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  const db = await connection();
  const collection = db.collection("users");

  const user = await collection.findOne({
    _id: decoded.id,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.refreshToken !== refreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const accessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  await collection.updateOne(
    { _id: user._id },
    {
      $set: {
        refreshToken: newRefreshToken,
      },
    },
  );

  return res.status(200).json({
    success: true,
    message: "Tokens refreshed successfully",
    accessToken,
    refreshToken: newRefreshToken,
  });
};
