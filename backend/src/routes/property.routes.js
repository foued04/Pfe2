const express = require('express');
const { auth } = require('../middlewares/auth.middleware');
const propertyController = require('../controllers/property.controller');

const router = express.Router();

router
  .route('/')
  .post(auth, propertyController.createProperty)
  .get(auth, propertyController.getProperties);

router
  .route('/:propertyId')
  .get(propertyController.getProperty)
  .put(auth, propertyController.updateProperty)
  .delete(auth, propertyController.deleteProperty);

module.exports = router;
