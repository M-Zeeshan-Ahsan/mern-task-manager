import { z } from "zod";

export const registrationSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters"),

  email: z.string().trim().email("Please enter a valid email address"),

  password: z.string().min(5, "Password must be at least 5 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),

  password: z.string().min(5, "Password must be at least 5 characters"),
});
