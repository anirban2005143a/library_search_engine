import { z } from "zod";

export const generateOtpSchema = z.object({
  body: z.object({
    email: z.string().email({ message: "Please provide a valid email" }),
  }),
  query: z.object({}),
  params: z.object({}),
});
