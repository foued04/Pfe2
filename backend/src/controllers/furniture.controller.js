const Furniture = require('../models/Furniture.model');
const FurnitureOrder = require('../models/FurnitureOrder.model');
const FurnitureChangeRequest = require('../models/FurnitureChangeRequest.model');
const Contract = require('../models/Contract.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * Get all furniture items
 */
const getFurniture = asyncHandler(async (req, res) => {
  const furniture = await Furniture.find({});
  res.status(200).json(furniture);
});

/**
 * Create or Update a Furniture Order (Voucher)
 * The _id of the order is the same as the contract _id
 */
const saveFurnitureOrder = asyncHandler(async (req, res) => {
  const { contractId, items, total } = req.body;

  if (!contractId || !items || items.length === 0) {
    throw new ApiError(400, 'Contract ID and items are required');
  }

  // Verify contract exists
  const contract = await Contract.findById(contractId);
  if (!contract) {
    throw new ApiError(404, 'Contract not found');
  }

  // Check if order already exists
  let order = await FurnitureOrder.findById(contractId);

  if (order) {
    // Update existing order
    order.items = items;
    order.total = total;
    await order.save();
  } else {
    // Create new order with same ID as contract
    order = new FurnitureOrder({
      _id: contractId,
      contract: contractId,
      tenant: contract.tenant,
      property: contract.property,
      owner: contract.owner,
      items: items,
      total: total,
      status: 'Confirmé'
    });
    await order.save();
  }

  res.status(201).json(order);
});

/**
 * Get furniture order by contract ID
 */
const getFurnitureOrderByContract = asyncHandler(async (req, res) => {
  const { contractId } = req.params;
  const order = await FurnitureOrder.findById(contractId).populate('items.furniture');
  
  if (!order) {
    return res.status(404).json({ message: 'No furniture order found for this contract' });
  }

  res.status(200).json(order);
});

/**
 * Get all furniture orders for an owner
 */
const getFurnitureOrdersForOwner = asyncHandler(async (req, res) => {
  // If owner is passed as string (email) in model, use that. 
  // In our models, owner is String (email) in FurnitureOrder but ObjectId in Contract.
  // We need to be careful. Let's use the email from req.user if available.
  const ownerId = req.user.email || req.user._id;
  
  const orders = await FurnitureOrder.find({ owner: ownerId })
    .populate('items.furniture')
    .sort({ createdAt: -1 });

  res.status(200).json(orders);
});

/**
 * Create a furniture change request
 */
const createChangeRequest = asyncHandler(async (req, res) => {
  const { furnitureId, contractId, type, reason, description, photo } = req.body;

  if (!furnitureId || !contractId || !type || !reason) {
    throw new ApiError(400, 'All fields are required');
  }

  const changeRequest = await FurnitureChangeRequest.create({
    furnitureId,
    contractId,
    tenantId: req.user.email || req.user._id,
    type,
    reason,
    description,
    photo
  });

  res.status(201).json(changeRequest);
});

/**
 * Get change requests for a contract
 */
const getChangeRequestsByContract = asyncHandler(async (req, res) => {
  const { contractId } = req.params;
  const requests = await FurnitureChangeRequest.find({ contractId })
    .populate('furnitureId')
    .sort({ createdAt: -1 });

  res.status(200).json(requests);
});

module.exports = {
  getFurniture,
  saveFurnitureOrder,
  getFurnitureOrderByContract,
  getFurnitureOrdersForOwner,
  createChangeRequest,
  getChangeRequestsByContract
};
