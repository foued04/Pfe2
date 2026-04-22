const Furniture = require('../models/Furniture.model');
const FurnitureOrder = require('../models/FurnitureOrder.model');
const FurnitureChangeRequest = require('../models/FurnitureChangeRequest.model');
const Contract = require('../models/Contract.model');
const Property = require('../models/Property.model');
const Notification = require('../models/Notification.model');
const User = require('../models/User.model');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * Get all furniture items
 */
const getFurniture = asyncHandler(async (req, res) => {
  let query = {};
  const role = req.user?.role;

  if (role === 'admin' || role === 'tenant') {
    // Admin and tenant can browse the full furniture catalog.
    query = {};
  } else if (role === 'owner') {
    // Owner sees approved catalog items plus the items they proposed.
    query = {
      $or: [{ status: 'approved' }, { addedBy: req.user?._id }],
    };
  } else {
    // Public/unauthenticated users only see approved items.
    query = { status: 'approved' };
  }

  const furniture = await Furniture.find(query);
  res.status(200).json(furniture);
});

/**
 * Get furniture items for a specific property
 */
const getFurnitureByProperty = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;

  // 1. Fetch the property to check furnishing items
  const property = await Property.findById(propertyId);
  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  // 2. Fetch confirmed orders for this property
  const confirmedOrders = await FurnitureOrder.find({
    property: propertyId,
    status: 'Confirmé'
  }).populate('items.furniture');

  // 3. Extract furniture items from orders
  let existingFurniture = [];
  
  // Add items from confirmed orders
  confirmedOrders.forEach(order => {
    order.items.forEach(item => {
      if (item.furniture) {
        existingFurniture.push({
          ...item.furniture._doc,
          id: item.furniture._id,
          quantity: item.quantity,
          orderSource: 'order'
        });
      }
    });
  });

  // 4. Also check property.furnishing.items if they exist (legacy or direct assignment)
  if (property.furnishing && property.furnishing.items && property.furnishing.items.length > 0) {
    // We would need to populate these if they were refs, but based on the model they might be direct objects
    // For now, we'll just merge them if not already present
    property.furnishing.items.forEach(item => {
      const alreadyAdded = existingFurniture.find(f => f.id.toString() === (item.furniture?._id || item.furniture)?.toString());
      if (!alreadyAdded) {
        existingFurniture.push({
          ...item,
          orderSource: 'property'
        });
      }
    });
  }

  res.status(200).json(existingFurniture);
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
    addedBy: req.user._id,
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

  const furniture = await Furniture.findByIdAndUpdate(id, { status }, { new: true });

  if (!furniture) {
    throw new ApiError(404, 'Furniture not found');
  }

  res.status(200).json(furniture);
});

/**
 * Create or Update a Furniture Order (Voucher)
 * The _id of the order is the same as the contract _id when contractId is provided
 */
const saveFurnitureOrder = asyncHandler(async (req, res) => {
  const { contractId, propertyId, items, total, paymentMethod } = req.body;

  if ((!contractId && !propertyId) || !items || items.length === 0) {
    throw new ApiError(400, 'Contract/Property ID and items are required');
  }

  let property;
  let tenantValue;
  let ownerValue;

  if (contractId) {
    // Ordering via contract (Tenant workflow)
    const contract = await Contract.findById(contractId).populate('property');
    if (!contract) {
      throw new ApiError(404, 'Contract not found');
    }

    property = contract.property?._id || contract.property;
    tenantValue = (contract.tenant?._id || contract.tenant)?.toString();
    ownerValue = (contract.owner?._id || contract.owner)?.toString();

    if (req.user.role === 'tenant' && tenantValue !== req.user._id.toString()) {
      throw new ApiError(403, 'You do not have permission to order for this contract');
    }

    if (req.user.role === 'owner' && ownerValue !== req.user._id.toString()) {
      throw new ApiError(403, 'You do not have permission to order for this contract');
    }
  } else {
    // Ordering via property directly (Owner or Tenant workflow)
    const propertyObj = await Property.findById(propertyId);
    if (!propertyObj) {
      throw new ApiError(404, 'Property not found');
    }

    property = propertyObj._id;
    ownerValue = propertyObj.owner?.toString();
    tenantValue = req.user.role === 'tenant' ? req.user._id.toString() : undefined;

    if (req.user.role === 'owner' && ownerValue !== req.user._id.toString()) {
      throw new ApiError(403, 'You do not have permission to order for this property');
    }
  }

  const orderId = contractId || new mongoose.Types.ObjectId();
  let order = await FurnitureOrder.findById(orderId);

  const orderStatus = req.user.role === 'owner' ? 'Confirmé' : 'Brouillon';

  if (order) {
    order.items = items;
    order.total = total;
    order.paymentMethod = paymentMethod || order.paymentMethod;
    if (tenantValue) {
      order.tenant = tenantValue;
    }
    await order.save();
  } else {
    order = new FurnitureOrder({
      _id: orderId,
      contract: contractId || undefined,
      tenant: tenantValue || undefined,
      property,
      owner: ownerValue,
      items,
      total,
      paymentMethod: paymentMethod || 'cash',
      status: orderStatus,
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
  const ownerCandidates = [req.user._id?.toString(), req.user.email].filter(Boolean);

  const orders = await FurnitureOrder.find({ owner: { $in: ownerCandidates } })
    .populate('items.furniture')
    .sort({ createdAt: -1 });

  res.status(200).json(orders);
});

/**
 * Get all furniture orders for a tenant
 */
const getFurnitureOrdersForTenant = asyncHandler(async (req, res) => {
  const tenantCandidates = [req.user._id?.toString(), req.user.email].filter(Boolean);

  const orders = await FurnitureOrder.find({ tenant: { $in: tenantCandidates } })
    .populate('items.furniture')
    .sort({ createdAt: -1 });

  res.status(200).json(orders);
});

/**
 * Create a furniture change request
 */
const createChangeRequest = asyncHandler(async (req, res) => {
  const { furnitureId, contractId, propertyId, type, reason, description, photo } = req.body;

  if (!furnitureId || (!contractId && !propertyId) || !type || !reason) {
    throw new ApiError(400, 'Furniture, context and reason are required');
  }

  const furniture = await Furniture.findById(furnitureId);
  if (!furniture) {
    throw new ApiError(404, 'Furniture not found');
  }

  let resolvedContractId = contractId;
  let resolvedPropertyId = propertyId;
  let ownerRecipientId = null;

  if (contractId) {
    const contract = await Contract.findById(contractId);

    if (contract) {
      resolvedPropertyId = resolvedPropertyId || contract.property?.toString();
      ownerRecipientId = contract.owner?.toString();

      if (req.user.role === 'tenant' && contract.tenant?.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You do not have permission to request a change for this contract');
      }
    } else {
      // Fallback: if frontend sends a furniture-order id as context id
      const order = await FurnitureOrder.findById(contractId);
      if (!order) {
        throw new ApiError(404, 'Contract or order not found');
      }

      resolvedPropertyId = resolvedPropertyId || order.property?.toString();
      ownerRecipientId = order.owner?.toString() || null;

      if (req.user.role === 'tenant' && order.tenant && order.tenant.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You do not have permission to request a change for this order');
      }
    }
  }

  if (!ownerRecipientId && resolvedPropertyId) {
    const property = await Property.findById(resolvedPropertyId);
    if (!property) {
      throw new ApiError(404, 'Property not found');
    }
    ownerRecipientId = property.owner?.toString() || null;
  }

  if (!resolvedContractId) {
    resolvedContractId = new mongoose.Types.ObjectId();
  }

  const changeRequest = await FurnitureChangeRequest.create({
    furnitureId,
    contractId: resolvedContractId,
    propertyId: resolvedPropertyId,
    tenantId: req.user.email || req.user._id,
    type,
    reason,
    description,
    photo,
  });

  if (ownerRecipientId) {
    let recipientUserId = ownerRecipientId;

    if (!mongoose.Types.ObjectId.isValid(recipientUserId)) {
      const ownerUser = await User.findOne({ email: ownerRecipientId });
      recipientUserId = ownerUser?._id?.toString();
    }

    if (recipientUserId && mongoose.Types.ObjectId.isValid(recipientUserId)) {
      await Notification.create({
        recipient: recipientUserId,
        type: 'Système',
        title: 'Nouvelle demande de changement de meuble',
        preview: `Un locataire a demandé un changement pour "${furniture.name}".`,
        content: `Le locataire a soumis une demande de changement (${type}) pour "${furniture.name}". Raison: ${reason}.`,
      });
    }
  }

  res.status(201).json(changeRequest);
});

/**
 * Get change requests for a contract
 */
const getChangeRequestsByContract = asyncHandler(async (req, res) => {
  const { contractId } = req.params;
  const requests = await FurnitureChangeRequest.find({ contractId }).populate('furnitureId').sort({ createdAt: -1 });

  res.status(200).json(requests);
});

module.exports = {
  getFurniture,
  addFurniture,
  updateFurniture,
  deleteFurniture,
  updateFurnitureStatus,
  getFurnitureByProperty,
  saveFurnitureOrder,
  getFurnitureOrderByContract,
  getFurnitureOrdersForOwner,
  getFurnitureOrdersForTenant,
  createChangeRequest,
  getChangeRequestsByContract,
};
