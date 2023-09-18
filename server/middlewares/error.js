const ErrorHandler = require("../utis/errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  if (process.env.NODE_ENV === "production") {
    let message = err.message;
    let error = new Error(message);

    if (err.name === "ValidationError") {
      message = Object.values(err.errors).map((value) => value.message);
      err.statusCode = 400;
    }

    if (err.name === "CastError") {
      message = `Resource not Found ${err.path}`;
      err.statusCode = 400;
    }

    if (err.code === 11000) {
      message = `Duplicate ${Object.keys(err.keyValue)} error`;
      err.statusCode = 400;
    }

    if (err.name === "JSONWebTokenError") {
      message = "JSON web token is invalid. Try again";
      err.statusCode = 400;
    }
    
    if (err.name === "TokenExpiredError") {
      message = "JSON web token is expired. Try again";
      err.statusCode = 400;
    }

    res.status(err.statusCode).json({
      success: false,
      message: message || "Internal Server Error",
    });
  }
};
