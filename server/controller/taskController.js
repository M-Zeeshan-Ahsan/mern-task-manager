import { ObjectId } from "mongodb";
import { collectionName, connection } from "../dbconfig.js";

export const getTasks = async (req, res) => {
  const db = await connection();
  const collection = await db.collection(collectionName);
  const { id } = req.query;
  if (id) {
    const task = await collection.findOne({ _id: new ObjectId(id) });
    return res.send({
      success: true,
      message: "Task fetched successfully",
      data: task,
    });
  }
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const search = req.query.search || "";
  const filter = {
    $or: [
      {
        title: {
          $regex: search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: search,
          $options: "i",
        },
      },
    ],
  };
  const skip = (page - 1) * limit;
  const totalTasks = await collection.countDocuments(filter);
  const result = await collection
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
  console.log(result);
  if (result) {
    res.send({
      message: "fetch task successfully",
      success: true,
      data: result,
      pagination: {
        totalTasks,
        currentPage: page,
        totalPages: Math.ceil(totalTasks / limit),
        limit,
      },
    });
  } else {
    res.send({
      message: "no task found",
      success: false,
      data: null,
    });
  }
};

export const specificTask = async (req, res) => {
  const db = await connection();
  const collection = await db.collection(collectionName);
  const result = await collection.findOne({ _id: new ObjectId(req.params.id) });

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
};

export const createTask = async (req, res) => {
  const db = await connection();
  const collection = await db.collection(collectionName);
  const task = { ...req.body, createdAt: new Date() };
  const result = await collection.insertOne(task);
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
};

export const updateTask = async (req, res) => {
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
};

export const deleteTask = async (req, res) => {
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
};

export const deleteMultipleTask = async (req, res) => {
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
};
