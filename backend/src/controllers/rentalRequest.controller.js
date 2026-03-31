const asyncHandler = require('../utils/asyncHandler');
const rentalRequestService = require('../services/rentalRequest.service');
const ApiError = require('../utils/ApiError');

const createRequest = asyncHandler(async (req, res) => {
  const requestBody = {
    ...req.body,
    tenant: req.user._id,
    date: new Date().toLocaleDateString('fr-FR'),
  };
  const request = await rentalRequestService.createRentalRequest(requestBody);
  res.status(201).send(request);
});

const getRequests = asyncHandler(async (req, res) => {
  const filter = {};
  
  if (req.user.role === 'owner') {
    // For owners, we need to filter requests for properties they own
    // This is better done with a more complex query or finding propertyIds first
    const Property = require('../models/Property.model');
    const ownerProperties = await Property.find({ owner: req.user._id }).select('_id');
    const propertyIds = ownerProperties.map(p => p._id);
    filter.property = { $in: propertyIds };
  } else if (req.user.role === 'tenant') {
    filter.tenant = req.user._id;
  }
  
  const result = await rentalRequestService.queryRentalRequests(filter);
  res.send(result);
});

const updateRequestStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const requestId = req.params.requestId;

  const request = await rentalRequestService.getRentalRequestById(requestId);
  
  // Authorization: Only owner of the property can update status
  if (request.property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Forbidden');
  }

  const updatedRequest = await rentalRequestService.updateRentalRequestStatus(requestId, status);
  
  // If status is "Contrat actif", update property status to "rented"
  if (status === "Contrat actif") {
    const propertyService = require('../services/property.service');
    await propertyService.updatePropertyById(request.property._id, { status: 'rented' });
  }

  res.send(updatedRequest);
});

module.exports = {
  createRequest,
  getRequests,
  updateRequestStatus,
};
