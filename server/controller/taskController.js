import { ObjectId } from "mongodb";
import { collectionName, connection } from "../dbconfig.js";
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
  deleteMultipleTaskSchema,
} from "../validation/taskValidation.js";
import ApiError from "../middleware/ApiError.js";

export const getTasks = async (req, res, next) => {
  try {
    const db = await connection();
    const collection = await db.collection(collectionName);
    const id = req.query.id;
    if (id) {
      if (!ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid task id");
      }

      const task = await collection
        .aggregate([
          {
            $match: {
              _id: new ObjectId(id),
              userId: req.user.id,
            },
          },
          {
            $lookup: {
              from: "categories",
              localField: "categoryId",
              foreignField: "_id",
              as: "category",
            },
          },
          {
            $unwind: {
              path: "$category",
              preserveNullAndEmptyArrays: true,
            },
          },
        ])
        .toArray();

      if (task.length === 0) {
        throw new ApiError(404, "Task not found");
      }

      return res.status(200).json({
        success: true,
        message: "Task fetched successfully",
        data: task[0],
      });
    }
    const search = req.query.search || "";
    const status = req.query.status || "";
    const filter = {
      userId: req.user.id,
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
    if (status) {
      filter.status = status;
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const totalTasks = await collection.countDocuments(filter);
    // const result = await collection
    //   .find(filter)
    //   .sort({ createdAt: -1 })
    //   .skip(skip)
    //   .limit(limit)
    //   .toArray();
    const result = await collection
      .aggregate([
        {
          $match: filter,
        },
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            title: 1,
            description: 1,
            image: 1,
            createdAt: 1,
            status: 1,
            "category._id": 1,
            "category.name": 1,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ])
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
    next(error);
  }
};

export const specificTask = async (req, res, next) => {
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

    // const result = await collection.findOne({
    //   _id: new ObjectId(id),
    //   userId: req.user.id,
    // });
    const result = await collection
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id),
            userId: req.user.id,
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: {
            path: "$category",
          },
        },
      ])
      .toArray();

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
      data: result[0],
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description, image, categoryId } = req.body;

    const db = await connection();
    const collection = await db.collection(collectionName);
    const categoryCollection = db.collection("categories");
    if (!ObjectId.isValid(categoryId)) {
      throw new ApiError(400, "Invalid category id");
    }
    const category = await categoryCollection.findOne({
      _id: new ObjectId(categoryId),
      userId: req.user.id,
    });

    if (!category) {
      throw new ApiError(404, "Category not found");
    }
    const task = {
      title,
      description,
      image,
      status: "pending",
      categoryId: new ObjectId(categoryId),
      userId: req.user.id,
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
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    updateTaskSchema.parse(req.body);
    const { _id, title, description, image, categoryId } = req.body;
    const db = await connection();
    const collection = db.collection(collectionName);

    const fields = {};

    if (title) fields.title = title;
    if (description) fields.description = description;
    if (image) fields.image = image;
    if (categoryId) fields.categoryId = categoryId;

    const result = await collection.updateOne(
      {
        _id: new ObjectId(_id),
        userId: req.user.id,
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
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const id = req.params.id;

    const db = await connection();
    const collection = db.collection(collectionName);

    const result = await collection.deleteOne({
      _id: new ObjectId(id),
      userId: req.user.id,
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
    next(error);
  }
};

export const deleteMultipleTask = async (req, res, next) => {
  try {
    deleteMultipleTaskSchema.parse(req.body);
    const { ids } = req.body;

    const db = await connection();
    const collection = db.collection(collectionName);

    const selectedTasks = ids.map((id) => new ObjectId(id));

    const result = await collection.deleteMany({
      _id: {
        $in: selectedTasks,
      },
      userId: req.user.id,
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
    next(error);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid task id");
    }

    const db = await connection();
    const collection = db.collection(collectionName);

    const result = await collection.updateOne(
      {
        _id: new ObjectId(id),
        userId: req.user.id,
      },
      {
        $set: {
          status,
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new ApiError(404, "Task not found");
    }

    return res.status(200).json({
      success: true,
      message: "Task status updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
