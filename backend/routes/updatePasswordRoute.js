import express from "express";
import { updatePassword } from "../controllers/updatePassword.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { updatePasswordSchema } from "../validators/updatePassowordValidator.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

router.patch(
  "/",
  authenticate, // Ensures req.user is populated
  validateRequest(updatePasswordSchema),
  updatePassword,
);

export default router;
