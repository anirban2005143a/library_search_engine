import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { createLog } from "../utils/logging.js";

export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id; // From your auth middleware

  // 1. Fetch user from DB
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  // 2. Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    const error = new Error("The current password you entered is incorrect");
    error.status = 401;
    error.code = "INVALID_CURRENT_PASSWORD";
    throw error;
  }

  // 3. Prevent using the same password again
  if (currentPassword === newPassword) {
    const error = new Error("New password cannot be the same as the old one");
    error.status = 400;
    throw error;
  }

  // 4. Hash the new password
  const salt = await bcrypt.genSalt(10);
  const hashedNewPassword = await bcrypt.hash(newPassword, salt);

  // 5. Update in Database
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  createLog({
    action: "PASSWORD_UPDATED",
    entity: "User",
    entityId: userId,
    req, // req.user.id will be the person who changed it
  });

  res.status(200).json({
    status: "Success",
    message: "Password updated successfully. Please log in again if required.",
  });
};
