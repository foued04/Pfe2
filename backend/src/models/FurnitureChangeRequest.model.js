const mongoose = require('mongoose');

const furnitureChangeRequestSchema = new mongoose.Schema({
  furnitureId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Furniture',
    required: true 
  },
  contractId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Contract',
    required: false 
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: false
  },
  tenantId: { 
    type: String, // Tenant email or ID
    required: true 
  },
  type: { 
    type: String, 
    enum: ['Remplacement', 'Échange', 'Réparation', 'Suppression', 'Ajout'],
    required: true 
  },
  reason: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  photo: { 
    type: String // URL or base64
  },
  status: { 
    type: String, 
    enum: ['En attente', 'Approuvé', 'Refusé', 'En cours', 'Terminé'],
    default: 'En attente' 
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

module.exports = mongoose.model('FurnitureChangeRequest', furnitureChangeRequestSchema);
