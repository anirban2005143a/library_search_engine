import { z } from "zod";

export const changePasswordSchema = z.object({
  body: z.object({
    email: z.string().email({ message: "Please provide a valid email" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" })
      .regex(/[a-z]/, { message: "Must contain a lowercase letter" })
      .regex(/[A-Z]/, { message: "Must contain an uppercase letter" })
      .regex(/\d/, { message: "Must contain a number" }),
    otp: z
      .string()
      .length(6, { message: "OTP must be of 6 length" })
      .regex(/^\d+$/, { message: "OTP must contain only numbers" }),
  }),
  query: z.object({}),
  params: z.object({}),
});
