const RentalRequest = require('../models/RentalRequest.model');
const Property = require('../models/Property.model');
const ApiError = require('../utils/ApiError');

const createRentalRequest = async (requestBody) => {
  const property = await Property.findById(requestBody.property);
  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  const rentalRequest = await RentalRequest.create(requestBody);

  // Create notification for the owner
  const Notification = require('../models/Notification.model');
  await Notification.create({
    recipient: property.owner,
    type: 'Système',
    title: 'Nouvelle demande de location',
    preview: `Une nouvelle demande pour "${property.title}" est arrivée.`,
    content: `Le locataire a envoyé une demande pour le bien situé à ${property.address}. Loyer: ${property.rent} TND.`,
    status: 'En attente',
    isRead: false
  });

  return rentalRequest;
};

const queryRentalRequests = async (filter = {}) => {
  return RentalRequest.find(filter)
    .populate('tenant', 'fullName email phone')
    .populate('property', 'title address rent images owner');
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

const deleteRentalRequestById = async (id) => {
  const request = await RentalRequest.findById(id);
  if (!request) {
    throw new ApiError(404, 'Rental request not found');
  }
  await request.deleteOne();
  return request;
};

module.exports = {
  createRentalRequest,
  queryRentalRequests,
  getRentalRequestById,
  updateRentalRequestStatus,
  deleteRentalRequestById,
};
