import { ObjectId } from "mongodb";
import { collectionName, connection } from "../dbconfig.js";
import jwt from "jsonwebtoken";

export const userRegistration = async (req, res) => {
  const userData = req.body;
  if (userData.email && userData.password) {
    const db = await connection();
    const collection = await db.collection("users");
    const result = await collection.insertOne(userData);
    if (result) {
      jwt.sign(userData, "Google", { expiresIn: "2d" }, (error, token) => {
        res.send({
          message: "user register successfully",
          success: true,
          token,
        });
      });
    } else {
      res.send({
        success: false,
        message: "user register failed",
      });
    }
  } else {
    res.send({ message: "user register failed", success: false });
  }
};

export const userLogin = async (req, res) => {
  const userData = req.body;
  if (userData.email && userData.password) {
    const db = await connection();
    const collection = await db.collection("users");
    const result = await collection.findOne({
      email: userData.email,
      password: userData.password,
    });
    if (result) {
      jwt.sign(userData, "Google", { expiresIn: "2d" }, (error, token) => {
        res.send({
          success: true,
          message: "login done",
          token,
        });
      });
    } else {
      res.send({
        success: false,
        message: "user not found",
      });
    }
  } else {
    res.send({
      success: false,
      message: "login not done",
    });
  }
};
