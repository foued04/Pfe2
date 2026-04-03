const mongoose = require('mongoose');

const furnitureOrderSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId }, // Will use the Contract ID
  contract: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Contract', 
    required: true 
  },
  tenant: { 
    type: String, 
    required: true 
  },
  property: { 
    type: String, 
    required: true 
  },
  owner: { 
    type: String, 
    required: true 
  },
  items: [{
    furniture: { type: mongoose.Schema.Types.ObjectId, ref: 'Furniture' },
    name: { type: String },
    quantity: { type: Number, default: 1 },
    price: { type: Number }
  }],
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Brouillon', 'Confirmé'], 
    default: 'Brouillon' 
  },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('FurnitureOrder', furnitureOrderSchema);
