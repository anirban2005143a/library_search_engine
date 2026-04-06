import { prisma } from "../config/db.js";

export const createLog = async ({ action, entity, entityId, req, details = {} }) => {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        actorId: req.user.id,
        actorEmail: req.user.email,
        details,
      },
    });
  } catch (err) {
    // We log the error but don't "throw" it. 
    // We don't want an Audit Log failure to stop the main business logic.
    console.error("Failed to create audit log:", err);
  }
};