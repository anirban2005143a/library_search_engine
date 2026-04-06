export const authorize = (roles = []) => {
  // If a single string is passed, convert to array
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    // 1. Ensure authenticate() ran first and populated req.user
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // 2. Check if user's role is in the allowed list
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access Denied: ${req.user.role} role does not have permission.` 
      });
    }

    next();
  };
};