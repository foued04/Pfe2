const express = require('express');
const router = express.Router();
const furnitureController = require('../controllers/furniture.controller');
const { auth } = require('../middlewares/auth.middleware');

// Public or Tenant/Owner access
router.get('/', furnitureController.getFurniture);

// Protected routes
router.post('/order', auth, furnitureController.saveFurnitureOrder);
router.get('/order/:contractId', auth, furnitureController.getFurnitureOrderByContract);
router.get('/owner-orders', auth, furnitureController.getFurnitureOrdersForOwner);

// Change requests
router.post('/change-requests', auth, furnitureController.createChangeRequest);
router.get('/change-requests/:contractId', auth, furnitureController.getChangeRequestsByContract);

module.exports = router;
