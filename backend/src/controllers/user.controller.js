const User = require('../models/User.model');
const Property = require('../models/Property.model');
const RentalRequest = require('../models/RentalRequest.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * Get all users with filters
 * GET /api/users
 */
const getUsers = asyncHandler(async (req, res) => {
  const { role, search, status } = req.query;
  
  const query = {};
  
  if (role && role !== 'all') {
    query.role = role;
  }
  
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query).select('-password').sort({ createdAt: -1 });

  // Enrich users with stats (properties for owners, requests for tenants)
  const enrichedUsers = await Promise.all(users.map(async (user) => {
    const userData = user.toObject();
    
    if (user.role === 'owner') {
      userData.propertyCount = await Property.countDocuments({ ownerId: user._id });
    } else if (user.role === 'tenant') {
      userData.requestCount = await RentalRequest.countDocuments({ tenantId: user._id });
    }
    
    return userData;
  }));

  res.send(enrichedUsers);
});

/**
 * Update user (status, role, etc)
 * PATCH /api/users/:id
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.send(user);
});

/**
 * Delete user
 * DELETE /api/users/:id
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.send({ message: 'User deleted successfully' });
});

module.exports = {
  getUsers,
  updateUser,
  deleteUser
};
