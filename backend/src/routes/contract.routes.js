const express = require('express');
const { auth } = require('../middlewares/auth.middleware');
const contractController = require('../controllers/contract.controller');

const router = express.Router();

router.post('/generate', auth, contractController.generateContract);
router.get('/request/:requestId', auth, contractController.getContract);
router.put('/:contractId/sign', auth, contractController.signContract);

module.exports = router;
