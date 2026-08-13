const express = require('express');
const router = express.Router();
const { register, login, sendOTP, verifyOTP, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/change-password', protect, changePassword);

module.exports = router;
