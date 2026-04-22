const express = require('express');
const router = express.Router();
const furnitureController = require('../controllers/furniture.controller');
const { auth, optionalAuth } = require('../middlewares/auth.middleware');

// Public or Tenant/Owner access
router.get('/', optionalAuth, furnitureController.getFurniture);

// Protected routes
router.post('/', auth, furnitureController.addFurniture);
router.put('/:id', auth, furnitureController.updateFurniture);
router.delete('/:id', auth, furnitureController.deleteFurniture);
router.patch('/:id/status', auth, furnitureController.updateFurnitureStatus); // Admin usually

router.get('/property/:propertyId', auth, furnitureController.getFurnitureByProperty);
router.post('/order', auth, furnitureController.saveFurnitureOrder);
router.get('/order/:contractId', auth, furnitureController.getFurnitureOrderByContract);
router.get('/owner-orders', auth, furnitureController.getFurnitureOrdersForOwner);
router.get('/tenant-orders', auth, furnitureController.getFurnitureOrdersForTenant);

// Change requests
router.post('/change-requests', auth, furnitureController.createChangeRequest);
router.get('/change-requests/:contractId', auth, furnitureController.getChangeRequestsByContract);

module.exports = router;
