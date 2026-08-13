const express = require('express');
const router = express.Router();
const { createPayment, getPayments, getPaymentById, deletePayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createPayment)
  .get(protect, getPayments);

router.route('/:id')
  .get(protect, getPaymentById)
  .delete(protect, deletePayment);

module.exports = router;
