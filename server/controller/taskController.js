import { ObjectId } from "mongodb";
import { collectionName, connection } from "../dbconfig.js";

export const getTasks = async (req, res) => {
  try {
    const db = await connection();
    const collection = await db.collection(collectionName);
    const id = req.query.id;
    if (id) {
      const task = await collection.findOne({ _id: new ObjectId(id) });
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
          data: null,
        });
      }
      return res.status(200).json({
        success: true,
        message: "Task fetched successfully",
        data: task,
      });
    }
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
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const totalTasks = await collection.countDocuments(filter);
    const result = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data: result,
      pagination: {
        totalTasks,
        currentPage: page,
        totalPages: Math.ceil(totalTasks / limit),
        limit,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong, try again later",
      error: error.message,
    });
  }
};

export const specificTask = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Task id is required",
        data: null,
      });
    }

    const db = await connection();
    const collection = db.collection(collectionName);

    const result = await collection.findOne({
      _id: new ObjectId(id),
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task fetched successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong, try again later",
      error: error.message,
    });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, image } = req.body;

    if (!title || !description || !image) {
      return res.status(400).json({
        success: false,
        message: "Title, Image and Description are required",
        data: null,
      });
    }

    const db = await connection();
    const collection = db.collection(collectionName);

    const task = {
      title,
      description,
      image,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(task);

    if (result.insertedId) {
      return res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: result,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Task not created",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong, try again later",
      error: error.message,
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { _id, title, description, image } = req.body;

    if (!_id) {
      return res.status(400).json({
        success: false,
        message: "Task id is required",
        data: null,
      });
    }

    if (!title && !description && !image) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update",
        data: null,
      });
    }

    const db = await connection();
    const collection = db.collection(collectionName);

    const fields = {};

    if (title) fields.title = title;
    if (description) fields.description = description;
    if (image) fields.image = image;

    const result = await collection.updateOne(
      {
        _id: new ObjectId(_id),
      },
      {
        $set: fields,
      },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong, try again later",
      error: error.message,
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Task id is required",
        data: null,
      });
    }

    const db = await connection();
    const collection = db.collection(collectionName);

    const result = await collection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong, try again later",
      error: error.message,
    });
  }
};

export const deleteMultipleTask = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Task ids are required",
        data: null,
      });
    }

    const db = await connection();
    const collection = db.collection(collectionName);

    const selectedTasks = ids.map((id) => new ObjectId(id));

    const result = await collection.deleteMany({
      _id: {
        $in: selectedTasks,
      },
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No tasks found to delete",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tasks deleted successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong, try again later",
      error: error.message,
    });
  }
};
