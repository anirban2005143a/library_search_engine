import express from "express";
import { ChangePasswordController, login, logout, refreshToken } from "../controllers/authController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { loginSchema } from "../validators/authValidator.js";
import { validate } from "../validators/books.validate.js";
import { changePasswordSchema } from "../schema/auth.schema.js";

const router = express.Router();

// router.post("/register", register); // moved to src/routes/adminRoutes

router.post("/login", validateRequest(loginSchema), login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
// router.post("/forgot-passoword", forgotPassoword); 
router.post("/forgot-password" , validate(changePasswordSchema), ChangePasswordController)


export default router;
