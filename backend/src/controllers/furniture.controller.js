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
  let query = {};
  
  // If not admin, only show approved items OR items added by the user
  if (req.user?.role !== 'admin') {
    query = {
      $or: [
        { status: 'approved' },
        { addedBy: req.user?._id }
      ]
    };
  }
  
  const furniture = await Furniture.find(query);
  res.status(200).json(furniture);
});

/**
 * Add a new furniture item
 */
const addFurniture = asyncHandler(async (req, res) => {
  const { name, category, price, image, description } = req.body;

  if (!name || !category || !price || !image) {
    throw new ApiError(400, 'Name, category, price and image are required');
  }

  // Set initial status: owners need approval, admins are auto-approved
  const status = req.user.role === 'admin' ? 'approved' : 'pending';

  const furniture = await Furniture.create({
    name,
    category,
    price,
    image,
    description,
    status,
    addedBy: req.user._id
  });

  res.status(201).json(furniture);
});

/**
 * Update a furniture item
 */
const updateFurniture = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, category, price, image, description } = req.body;

  const furniture = await Furniture.findById(id);
  if (!furniture) {
    throw new ApiError(404, 'Furniture not found');
  }

  // Check permissions: only admin or the user who added it can update
  if (req.user.role !== 'admin' && furniture.addedBy?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not have permission to update this item');
  }

  const updatedFurniture = await Furniture.findByIdAndUpdate(
    id,
    { name, category, price, image, description },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedFurniture);
});

/**
 * Delete a furniture item
 */
const deleteFurniture = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const furniture = await Furniture.findById(id);
  if (!furniture) {
    throw new ApiError(404, 'Furniture not found');
  }

  // Check permissions
  if (req.user.role !== 'admin' && furniture.addedBy?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not have permission to delete this item');
  }

  await Furniture.findByIdAndDelete(id);
  res.status(200).json({ message: 'Furniture deleted successfully' });
});

/**
 * Update furniture status (Admin only)
 */
const updateFurnitureStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'approved'].includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }

  const furniture = await Furniture.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!furniture) {
    throw new ApiError(404, 'Furniture not found');
  }

  res.status(200).json(furniture);
});

/**
 * Create or Update a Furniture Order (Voucher)
 * The _id of the order is the same as the contract _id
 */
const saveFurnitureOrder = asyncHandler(async (req, res) => {
  const { contractId, propertyId, items, total, paymentMethod } = req.body;

  if ((!contractId && !propertyId) || !items || items.length === 0) {
    throw new ApiError(400, 'Contract/Property ID and items are required');
  }

  let property;
  let tenantEmail;
  let ownerEmail;
  let contract;

  if (contractId) {
    // Ordering via contract (Tenant workflow)
    contract = await Contract.findById(contractId).populate('property');
    if (!contract) {
      throw new ApiError(404, 'Contract not found');
    }
    property = contract.property;
    tenantEmail = contract.tenant;
    ownerEmail = contract.owner;
  } else {
    // Ordering via property directly (Owner workflow)
    const Property = require('../models/Property.model');
    const propertyObj = await Property.findById(propertyId);
    if (!propertyObj) {
      throw new ApiError(404, 'Property not found');
    }
    property = propertyObj._id;
    ownerEmail = propertyObj.owner;
    // For owners, the status is automatically 'Confirmé' as per user request
  }

  const orderId = contractId || new mongoose.Types.ObjectId();
  let order = await FurnitureOrder.findById(orderId);

  const orderStatus = req.user.role === 'owner' ? 'Confirmé' : 'Brouillon';

  if (order) {
    order.items = items;
    order.total = total;
    order.paymentMethod = paymentMethod || order.paymentMethod;
    await order.save();
  } else {
    order = new FurnitureOrder({
      _id: orderId,
      contract: contractId || undefined,
      tenant: tenantEmail || undefined,
      property: property,
      owner: ownerEmail,
      items: items,
      total: total,
      paymentMethod: paymentMethod || 'cash',
      status: orderStatus
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
  addFurniture,
  updateFurniture,
  deleteFurniture,
  updateFurnitureStatus,
  saveFurnitureOrder,
  getFurnitureOrderByContract,
  getFurnitureOrdersForOwner,
  createChangeRequest,
  getChangeRequestsByContract
};
