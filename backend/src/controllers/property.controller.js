const asyncHandler = require('../utils/asyncHandler');
const propertyService = require('../services/property.service');
const ApiError = require('../utils/ApiError');

const createProperty = asyncHandler(async (req, res) => {
  const propertyBody = {
    ...req.body,
    owner: req.user._id,
    moderationStatus: 'pending',
  };
  const property = await propertyService.createProperty(propertyBody);
  res.status(201).send(property);
});

const getProperties = asyncHandler(async (req, res) => {
  // If user is owner, they might only want their properties? 
  // Let's allow filtering by owner if provided, or default to all if admin
  const filter = {};
  if (req.user.role === 'owner') {
    filter.owner = req.user._id;
  } else if (req.user.role === 'tenant') {
    filter.moderationStatus = 'approved';
  }
  const result = await propertyService.queryProperties(filter);
  res.send(result);
});

const getProperty = asyncHandler(async (req, res) => {
  const property = await propertyService.getPropertyById(req.params.propertyId);
  res.send(property);
});

const updateProperty = asyncHandler(async (req, res) => {
  const property = await propertyService.getPropertyById(req.params.propertyId);
  const ownerId = property.owner?._id || property.owner;
  
  // Check authorization
  if (req.user.role !== 'admin' && (!ownerId || ownerId.toString() !== req.user._id.toString())) {
    throw new ApiError(403, 'Forbidden');
  }

  const updatedProperty = await propertyService.updatePropertyById(req.params.propertyId, req.body);
  res.send(updatedProperty);
});

const deleteProperty = asyncHandler(async (req, res) => {
  const property = await propertyService.getPropertyById(req.params.propertyId);
  const ownerId = property.owner?._id || property.owner;
  
  // Check authorization
  if (req.user.role !== 'admin' && (!ownerId || ownerId.toString() !== req.user._id.toString())) {
    throw new ApiError(403, 'Forbidden');
  }

  await propertyService.deletePropertyById(req.params.propertyId);
  res.status(204).send();
});

module.exports = {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
};
