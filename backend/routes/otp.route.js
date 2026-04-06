import { Router } from "express";
import { generateOTP, getFailedJobs } from "../controllers/otp.controller.js";
import { generateOtpSchema } from "../schema/otp.schema.js";
import { validate } from "../validators/books.validate.js";

export const otpRouter = Router()

otpRouter.post('/generate-otp', validate(generateOtpSchema), generateOTP)
otpRouter.get('/get-failed-jobs', getFailedJobs)