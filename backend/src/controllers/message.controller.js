const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');

const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id
  })
  .populate('participants', 'fullName role email')
  .populate('lastMessage')
  .sort({ updatedAt: -1 });
  
  res.send(conversations);
});

const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  
  const conversation = await Conversation.findById(conversationId);
  if (!conversation || !conversation.participants.includes(req.user._id)) {
    throw new ApiError(403, 'Forbidden');
  }
  
  const messages = await Message.find({ conversation: conversationId })
    .populate('sender', 'fullName role')
    .sort({ createdAt: 1 });
    
  res.send(messages);
});

const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, content, category, contextId, contextTitle, recipientId } = req.body;
  
  let conversation;
  
  if (conversationId) {
    conversation = await Conversation.findById(conversationId);
  } else if (contextId) {
    // Find or create conversation for this context
    conversation = await Conversation.findOne({ contextId, participants: req.user._id });
    
    if (!conversation && recipientId) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
        category: category || 'Demandes',
        contextId,
        contextTitle
      });
    }
  }
  
  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }
  
  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    content
  });
  
  conversation.lastMessage = message._id;
  await conversation.save();
  
  res.status(201).send(message);
});

const getConversationByContext = asyncHandler(async (req, res) => {
  const { contextId } = req.params;
  const conversation = await Conversation.findOne({ 
    contextId, 
    participants: req.user._id 
  }).populate('participants', 'fullName role');
  
  if (!conversation) {
    return res.status(200).send(null);
  }
  
  const messages = await Message.find({ conversation: conversation._id })
    .populate('sender', 'fullName role')
    .sort({ createdAt: 1 });
    
  res.send({ conversation, messages });
});

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  getConversationByContext
};
