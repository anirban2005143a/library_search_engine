import { prisma } from "../config/db.js";

export const getAuditLogs = async (req, res) => {
  // 1. Authorization Check (Only ADMIN or ROOT_ADMIN)
  if (req.user.role !== "ADMIN" && req.user.role !== "ROOT_ADMIN") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  // 2. Pagination & Filtering Params
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    // 3. Fetch logs and total count in parallel
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }, // Most recent first
        include: {
          actor: {
            select: {
              firstName: true,
              lastName: true,
              role: true
            }
          }
        }
      }),
      prisma.auditLog.count()
    ]);

    // 4. Send Response
    res.status(200).json({
      status: "Success",
      results: logs.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: logs
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching audit logs" });
  }
};