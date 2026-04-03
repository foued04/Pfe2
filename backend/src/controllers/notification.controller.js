const Notification = require('../models/Notification.model');
const asyncHandler = require('../utils/asyncHandler');

exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user.id })
    .sort({ createdAt: -1 });
  res.json(notifications);
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user.id },
    { isRead: true },
    { new: true }
  );
  if (!notification) {
    res.status(404).json({ message: 'Notification non trouvée' });
    return;
  }
  res.json(notification);
});

exports.createNotification = asyncHandler(async (req, res) => {
  const { recipient, type, title, preview, content, claimResponse, contractData } = req.body;
  const notification = new Notification({
    recipient,
    type,
    title,
    preview,
    content,
    claimResponse,
    contractData
  });
  await notification.save();
  res.status(201).json(notification);
});
