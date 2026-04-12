const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['Réclamation', 'Contrat', 'Système', 'Vérification'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  preview: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Vue par le propriétaire', 'En attente'],
    default: 'En attente'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  claimResponse: {
    message: String,
    intervention: {
      date: String,
      time: String,
      technician: String
    }
  },
  contractData: {
    contractId: String,
    propertyTitle: String,
    propertyAddress: String,
    propertyImage: String,
    startDate: String,
    endDate: String,
    rent: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
