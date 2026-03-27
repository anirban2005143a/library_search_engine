// middlewares/validate.js
export const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      console.log(result.error)
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    // attach validated data (optional but useful)
    req.validated = result.data;

    next();
  } catch (err) {
    next(err);
  }
};