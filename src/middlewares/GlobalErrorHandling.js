export const globalErrorHandling = (err, req, res, next) => {
  // To prevent multiple responses
  if (res.headersSent) {
    return next(err); // If headers are already sent, pass the error to the default error handler
  }
  
  const errorMessage = err.message || "Internal Server Error";
  const statusCode = err.statusCode || 500;

  if (process.env.MODE === "dev") {
    res.status(statusCode).json({
      error: errorMessage,
      stack: err.stack,
    });
  } else {
    res.status(statusCode).json({
      error: errorMessage,
    });
  }
};
