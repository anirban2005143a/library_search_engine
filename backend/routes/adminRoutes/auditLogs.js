import express from "express";
import { getAuditLogs } from "../../controllers/auditLogsController.js";
import { authenticate } from "../../middleware/authenticate.js";

const router =  express.Router();


router.get(
  "/admin/audit-logs",
  authenticate,
  getAuditLogs
);

export default router;