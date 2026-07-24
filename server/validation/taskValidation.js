import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),

  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters"),

  image: z.string().url("Invalid image URL").optional(),
});

export const updateTaskSchema = z
  .object({
    _id: z.string().length(24, "Invalid Task ID"),

    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .optional(),

    description: z
      .string()
      .trim()
      .min(5, "Description must be at least 5 characters")
      .optional(),

    image: z.string().url("Invalid image URL").optional(),
  })
  .refine((data) => data.title || data.description || data.image, {
    message: "At least one field is required to update",
    path: ["title"],
  });

export const taskIdSchema = z.object({
  id: z.string().trim().length(24, "Invalid Task ID"),
});

export const deleteMultipleTaskSchema = z.object({
  ids: z
    .array(z.string().length(24, "Invalid Task ID"))
    .min(1, "At least one task id is required"),
});
