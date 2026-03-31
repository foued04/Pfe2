const RentalRequest = require('../models/RentalRequest.model');
const Property = require('../models/Property.model');
const ApiError = require('../utils/ApiError');

const createRentalRequest = async (requestBody) => {
  const property = await Property.findById(requestBody.property);
  if (!property) {
    throw new ApiError(404, 'Property not found');
  }
  return RentalRequest.create(requestBody);
};

const queryRentalRequests = async (filter = {}) => {
  return RentalRequest.find(filter)
    .populate('tenant', 'fullName email phone')
    .populate('property', 'title address rent images');
};

const getRentalRequestById = async (id) => {
  const request = await RentalRequest.findById(id)
    .populate('tenant', 'fullName email phone')
    .populate('property', 'title address rent images owner');
  if (!request) {
    throw new ApiError(404, 'Rental request not found');
  }
  return request;
};

const updateRentalRequestStatus = async (requestId, status) => {
  const request = await getRentalRequestById(requestId);
  request.status = status;
  await request.save();
  return request;
};

module.exports = {
  createRentalRequest,
  queryRentalRequests,
  getRentalRequestById,
  updateRentalRequestStatus,
};
