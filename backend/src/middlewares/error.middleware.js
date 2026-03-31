const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  
  if (!err.statusCode) {
    statusCode = 500;
    message = 'Internal Server Error';
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).send(response);
};

module.exports = { errorHandler };
