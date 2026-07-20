import express from "express";
import cors from "cors";
import { collectionName, connection } from "./dbconfig.js";
import { ObjectId } from "mongodb";

const app = express();
app.use(express.json());
app.use(cors());
//get all tasks
app.get("/tasks", async (req, res) => {
  const db = await connection();
  const collection = await db.collection(collectionName);
  const result = await collection.find().toArray();
  console.log(result);
  if (result) {
    res.send({
      message: "fetch task successfully",
      success: true,
      data: result,
    });
  } else {
    res.send({
      message: "no task found",
      success: false,
      data: null,
    });
  }
});
//get specific task
app.get("/task/:id", async (req, res) => {
  const db = await connection();
  const collection = await db.collection(collectionName);
  const result = await collection.findOne({ _id: new ObjectId(req.params.id) });
  console.log(result);
  if (result) {
    res.send({
      message: "fetch task successfully",
      success: true,
      data: result,
    });
  } else {
    res.send({
      message: "no task found",
      success: false,
      data: null,
    });
  }
});
//create task
app.post("/create", async (req, res) => {
  const db = await connection();
  const collection = await db.collection(collectionName);
  const result = await collection.insertOne(req.body);
  if (result) {
    res.send({
      message: "task created successfully",
      success: true,
      data: result,
    });
  } else {
    res.send({
      message: "task not created",
      success: false,
      data: null,
    });
  }
});
//delete specific task
app.delete("/delete/:id", async (req, res) => {
  const db = await connection();
  const collection = await db.collection(collectionName);
  const result = await collection.deleteOne({
    _id: new ObjectId(req.params.id),
  });
  console.log(result);
  if (result) {
    res.send({
      message: "task delete successfully",
      success: true,
      data: result,
    });
  } else {
    res.send({
      message: "something went wrong, try again later",
      success: false,
      data: null,
    });
  }
});
//delete specific task
app.delete("/delete-multiple", async (req, res) => {
  const db = await connection();
  const collection = await db.collection(collectionName);
  const { ids } = req.body;
  const selectedTasks = ids.map((id) => new ObjectId(id));
  const result = await collection.deleteMany({ _id: { $in: selectedTasks } });
  console.log(result);
  if (result) {
    res.send({
      message: "task delete successfully",
      success: true,
      data: result,
    });
  } else {
    res.send({
      message: "something went wrong, try again later",
      success: false,
      data: null,
    });
  }
});
//update task
app.put("/update", async (req, res) => {
  const db = await connection();
  const collection = await db.collection(collectionName);
  const { _id, ...fields } = req.body;
  const result = await collection.updateOne(
    { _id: new ObjectId(_id) },
    { $set: fields },
  );
  if (result) {
    res.send({
      message: "task updated successfully",
      success: true,
      data: result,
    });
  } else {
    res.send({
      message: "something went wrong, try again later",
      success: false,
      data: null,
    });
  }
});

app.listen(3000);
