import { Router } from "express";
import { generateOTP, getFailedJobs } from "../controllers/otp.controller.js";
import { validate } from "../middlewares/validate.js";
import { generateOtpSchema } from "../schema/otp.schema.js";

export const otpRouter = Router()

otpRouter.post('/generate-otp', validate(generateOtpSchema), generateOTP)
otpRouter.get('/get-failed-jobs', getFailedJobs)