import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" }) // Explicit string type
    .trim() // Transform first
    .toLowerCase() // Transform second
    .email("Invalid email format") // Validate format last
    .min(1, "Email cannot be empty"), // Validate length last

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});


