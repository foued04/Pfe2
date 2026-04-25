const asyncHandler = require('../utils/asyncHandler');
const propertyService = require('../services/property.service');
const ApiError = require('../utils/ApiError');
const Contract = require('../models/Contract.model');

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
  const filter = {};
  
  if (!req.user) {
    // Public access: only show approved and available properties
    filter.moderationStatus = 'approved';
    filter.status = 'available';
  } else if (req.user.role === 'owner') {
    // Owner: see their own properties
    filter.owner = req.user._id;
  } else if (req.user.role === 'tenant') {
    // Tenant: only show approved properties that are still available
    filter.moderationStatus = 'approved';
    filter.status = 'available';
  }
  // Admin sees all by default (no filter added)
  
  const result = await propertyService.queryProperties(filter);

  if (req.user?.role === 'owner') {
    const signedContracts = await Contract.find({
      owner: req.user._id,
      status: { $in: ['SignedByTenant', 'SignedByBoth'] },
    }).select('property');
    const rentedPropertyIds = new Set(signedContracts.map((contract) => contract.property.toString()));

    return res.send(result.map((property) => {
      const propertyObject = property.toObject ? property.toObject() : property;
      return rentedPropertyIds.has(propertyObject._id.toString())
        ? { ...propertyObject, status: 'rented' }
        : propertyObject;
    }));
  }

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
