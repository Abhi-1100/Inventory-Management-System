const errorHandler = (err, req, res, next) => {
  console.error(err);
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: `${err.meta?.target?.join(', ')} already exists`,
      code: 'CONFLICT',
    });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Record not found',
      code: 'NOT_FOUND',
    });
  }
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
  });
};

module.exports = { errorHandler };
