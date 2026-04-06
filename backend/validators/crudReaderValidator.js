import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string({ required_error: "First name is required" })
    .min(2, "First name must be at least 2 characters long"),

  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters long")
    .optional(),

  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email format")
    .min(1, "Email cannot be empty"),

  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),

  role: z
    .enum(["ADMIN", "READER", "ROOT_ADMIN"], {
      errorMap: () => ({
        message: "Role must be one of: ADMIN, READER, ROOT_ADMIN",
      }),
    })
    .optional(),
});

const adminUpdateUserSchema = z.object({
  role: z.enum(["ADMIN", "READER", "ROOT_ADMIN"]).optional(),
});

const adminResetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

const deleteUsersSchema = z.object({
  emails: z
    .array(z.string().email("Invalid email format").toLowerCase().trim()) // Ensures every item is a valid email
    .min(1, "Please provide at least one email"), // Ensures the array isn't empty
});

const userIdParamsSchema = z.object({
  id: z.string().uuid("Invalid user ID format"),
});

const registerBulkSchema = z.array(registerSchema).nonempty("Provide atleast one user");

export {
  registerBulkSchema,
  deleteUsersSchema,
  adminResetPasswordSchema,
  adminUpdateUserSchema,
  userIdParamsSchema,
};
