import { z } from "zod"

export const registerUserSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters long"),

  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters long")
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email format")
    .min(1, "Email cannot be empty"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),

  role: z.enum(["ADMIN", "READER", "ROOT_ADMIN"]).optional(),
})

export type RegisterUserInput = z.infer<typeof registerUserSchema>

/**
 * Validate a single user entry and return field-specific errors
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateUser(user: any): Record<string, string> {
  const result = registerUserSchema.safeParse(user)

  if (result.success) {
    return {}
  }

  const errors: Record<string, string> = {}
  result.error.issues.forEach((issue) => {
    const fieldName = issue.path[0] as string
    errors[fieldName] = issue.message
  })

  return errors
}

/**
 * Validate if a user is completely valid
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isUserValid(user: any): boolean {
  return registerUserSchema.safeParse(user).success
}
