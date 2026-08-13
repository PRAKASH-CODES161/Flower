const express = require('express');
const router = express.Router();
const { createPurchase, getPurchases } = require('../controllers/purchaseController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createPurchase)
  .get(protect, getPurchases);

module.exports = router;
