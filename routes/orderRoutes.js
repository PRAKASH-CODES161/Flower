const express = require('express');
const router = express.Router();
const { create, getAll, update, remove } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, create)
  .get(protect, getAll);

router.route('/:id')
  .put(protect, update)
  .delete(protect, remove);

module.exports = router;
