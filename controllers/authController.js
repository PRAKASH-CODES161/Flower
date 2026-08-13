const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

exports.register = async (req, res) => {
    try {
        const { name, mobileNumber, password } = req.body;

        if (!name || !mobileNumber || !password) {
            return res.status(400).json({ error: 'Please add all fields' });
        }

        const userExists = await User.findOne({ mobileNumber });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            mobileNumber,
            password: hashedPassword,
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                mobileNumber: user.mobileNumber,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ error: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

exports.login = async (req, res) => {
    try {
        const { mobileNumber, password } = req.body;

        const user = await User.findOne({ mobileNumber });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                name: user.name,
                mobileNumber: user.mobileNumber,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

exports.sendOTP = async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    const user = await User.findOne({ mobileNumber });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Mock OTP for ${mobileNumber}: ${otp}`);
    
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();
    
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;
    const user = await User.findOne({ mobileNumber });
    if (!user || !user.otp || !user.otpExpiry) return res.status(400).json({ message: 'Invalid request' });
    
    if (user.otpExpiry < Date.now()) return res.status(400).json({ message: 'OTP expired' });
    
    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) return res.status(400).json({ message: 'Invalid OTP' });
    
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    
    res.json({ message: 'OTP verified successfully', token: generateToken(user._id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.password = req.body.password;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};
