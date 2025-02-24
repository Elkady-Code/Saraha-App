export const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      //   return res.status(500).json({
      //     msg: "Server error",
      //     message: error.message,
      //     stack: error.stack,
      //     error,
      //   });
      return next();
    });
  };
};


export const globalErrorHandler = (err, req, res, next) => {
  res.status(err["cause"] || 500).json({
    message: err.message,
    stack: err.stack,
  });
};
