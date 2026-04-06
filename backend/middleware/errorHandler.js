export function notFoundHandler(req, _res, next) {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.status = 404;
  err.code = "ROUTE_NOT_FOUND";
  next(err);
}

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const code = err.code || "INTERNAL_SERVER_ERROR";
  const message = err.message || "Something went wrong";
  
  console.log({
    success: false,
    error: {
      code,
      message,
      details: err.details || null,
    },
  })
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
      details: err.details || null,
    },
  });

}