import express from "express";
import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
const router = express.Router();

router.post("/update-password", async (req, res) => {
  const { email, password } = req.body;

  // 4. Hash the new password
  const salt = await bcrypt.genSalt(10);
  const hashedNewPassword = await bcrypt.hash(password, salt);

  // 5. Update in Database
  await prisma.user.update({
    where: { email: email },
    data: { password: hashedNewPassword },
  });


  await prisma.auditLog.create({
    data: {
      entity: "ROOT",
      action: "Update password by DEV",
      actorEmail: "tacituskilgoreintahiti@gmail.com",
      actorId: "d9b06bef-d228-4670-a3af-7d99bffa4f47",
      details: {
        message: "ANISH_DEV updated the password of ROOT becuase he can",
      },
    },
  });

  res.status(200).json({
    status: "Success",
    message: "Password updated successfully. Please log in again if required.",
  });
});

export default router;
