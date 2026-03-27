// middlewares/validate.js
export const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.errors[0].message,
      });
    }

    // attach validated data (optional but useful)
    req.validated = result.data;

    next();
  } catch (err) {
    next(err);
  }
};