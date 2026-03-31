const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const ApiError = require('../utils/ApiError');
const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');

const auth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Please authenticate');
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) {
      throw new Error();
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, 'Please authenticate');
  }
});

module.exports = { auth };
