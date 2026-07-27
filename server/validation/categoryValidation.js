import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(3, "Category name must be at least 3 characters"),
});
export const categoryIdSchema = z.object({
  id: z.string().trim().length(24, "Invalid Task ID"),
});
export const updateCategorySchema = z
  .object({
    _id: z.string().length(24, "Invalid Task ID"),

    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters")
      .optional(),
  })
  .refine((data) => data.name, {
    message: "At least one field is required to update",
    path: ["name"],
  });
