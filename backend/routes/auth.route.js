import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import { changePasswordSchema } from "../schema/auth.schema.js";
import { ChangePasswordController } from "../controllers/auth.controller.js";

export const authRouter = Router()

authRouter.post("/change-password" , validate(changePasswordSchema), ChangePasswordController)