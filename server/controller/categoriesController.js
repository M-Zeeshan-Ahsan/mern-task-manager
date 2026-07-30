import { object, success } from "zod";
import { connection } from "../dbconfig.js";
import ApiError from "../middleware/ApiError.js";
import { ObjectId } from "mongodb";
import { collectionName } from "../dbconfig.js";

const categoryCollectionName = "categories";

export const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const db = await connection();
    const collection = await db.collection(categoryCollectionName);
    const existingCategory = await collection.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      userId: req.user.id,
    });

    if (existingCategory) {
      throw new ApiError(400, "Category already exists");
    }
    const category = {
      name,
      userId: req.user.id,
      createdAt: new Date(),
    };
    const result = await collection.insertOne(category);
    if (result) {
      return res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: result,
      });
    }
    throw new ApiError(400, "Category not created");
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (req, res, next) => {
  try {
    const db = await connection();
    const collection = await db.collection(categoryCollectionName);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    // const result = await collection.find({ userId: req.user.id }).toArray();
    const result = await collection
      .aggregate([
        {
          $match: {
            userId: req.user.id,
          },
        },
        {
          $facet: {
            data: [
              {
                $project: {
                  name: 1,
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
            ],
            totalCount: [
              {
                $count: "totalCategories",
              },
            ],
          },
        },
      ])
      .toArray();
    const categories = result[0].data;
    const totalCategories = result[0].totalCount[0]?.totalCategories || 0;
    const totalPages = Math.ceil(totalCategories / limit);
    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
      pagination: {
        totalCategories,
        currentPage: page,
        totalPages: Math.ceil(totalCategories / limit),
        limit,
      },
    });
    throw new ApiError(404, "Category not found");
  } catch (error) {
    next(error);
  }
};
export const deleteCategory = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid category id");
    }
    const db = await connection();
    const collection = await db.collection(categoryCollectionName);
    const taskCollection = db.collection(collectionName);
    const taskExist = await taskCollection.findOne({
      categoryId: new ObjectId(id),
      userId: req.user.id,
    });
    if (taskExist) {
      throw new ApiError(
        400,
        "Category is already used in tasks. Delete those tasks first.",
      );
    }
    const result = await collection.deleteOne({
      _id: new ObjectId(id),
      userId: req.user.id,
    });
    if (result.deletedCount === 0) {
      throw new ApiError(404, "Category not found");
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const specificCategory = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Category id is required",
        data: null,
      });
    }

    const db = await connection();
    const collection = db.collection(categoryCollectionName);

    const result = await collection.findOne({
      _id: new ObjectId(id),
      userId: req.user.id,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const updateCategory = async (req, res, next) => {
  try {
    const { _id, name } = req.body;
    const db = await connection();
    const collection = db.collection(categoryCollectionName);

    const fields = {};

    if (name) fields.name = name;

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
        message: "category not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "category updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
