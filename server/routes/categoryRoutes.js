import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategory,
  specificCategory,
  updateCategory,
} from "../controller/categoriesController.js";
import verifyToken from "../middleware/verifyToken.js";
import validate from "../middleware/validate.js";
import {
  createCategorySchema,
  categoryIdSchema,
  updateCategorySchema,
} from "../validation/categoryValidation.js";

const router = express.Router();

router.post(
  "/create-category",
  verifyToken,
  validate(createCategorySchema),
  createCategory,
);
router.get("/get-category", verifyToken, getCategory);
router.delete(
  "/delete-category/:id",
  verifyToken,
  validate(categoryIdSchema, "params"),
  deleteCategory,
);
router.get(
  "/specific-category/:id",
  verifyToken,
  validate(categoryIdSchema, "params"),
  specificCategory,
);
router.put(
  "/update-category",
  verifyToken,
  validate(updateCategorySchema),
  updateCategory,
);
export default router;
