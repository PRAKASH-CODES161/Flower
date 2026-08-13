const fs = require('fs');
const path = require('path');

const baseDir = 'd:/flower/backend';

const dirs = [
  'config', 'controllers', 'middleware', 'models', 'routes', 'utils'
];

dirs.forEach(d => fs.mkdirSync(path.join(baseDir, d), { recursive: true }));

const files = {};

// Root files
files['.env.example'] = `PORT=5000\nMONGODB_URI=mongodb://localhost:27017/flower_shop\nJWT_SECRET=your_jwt_secret`;

files['server.js'] = `
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const flowerRoutes = require('./routes/flowerRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const salesRoutes = require('./routes/salesRoutes');
const stockRoutes = require('./routes/stockRoutes');
const orderRoutes = require('./routes/orderRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const labourRoutes = require('./routes/labourRoutes');
const wholesalerRoutes = require('./routes/wholesalerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/flowers', flowerRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/labour', labourRoutes);
app.use('/api/wholesalers', wholesalerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/profiles', profileRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
  });
}).catch(err => {
  console.error('Failed to connect to DB', err);
});
`;

files['config/db.js'] = `
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flower_shop');
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error(\`Error: \${error.message}\`);
    process.exit(1);
  }
};

module.exports = connectDB;
`;

files['middleware/authMiddleware.js'] = `
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
module.exports = { protect };
`;

// Models
const models = ['User', 'Flower', 'Purchase', 'Stock', 'Sale', 'SalesItem', 'Order', 'Expense', 'Labour', 'Wholesaler', 'Payment', 'Profile'];

files['models/User.js'] = `
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String },
  otpExpiry: { type: Date }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
`;

models.forEach(model => {
  if (model === 'User') return;
  files[\`models/\${model}.js\`] = \`
const mongoose = require('mongoose');

const schema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String },
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('\${model}', schema);
\`;
});

// Specific models modifications
files['models/Stock.js'] = `
const mongoose = require('mongoose');
const schema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flower' },
  quantity: { type: Number, default: 0 }
}, { timestamps: true });
module.exports = mongoose.model('Stock', schema);
`;

files['models/Wholesaler.js'] = `
const mongoose = require('mongoose');
const schema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  pendingAmount: { type: Number, default: 0 }
}, { timestamps: true });
module.exports = mongoose.model('Wholesaler', schema);
`;

files['models/Purchase.js'] = `
const mongoose = require('mongoose');
const schema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wholesalerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wholesaler' },
  flowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flower' },
  quantity: { type: Number, required: true },
  totalAmount: { type: Number, required: true }
}, { timestamps: true });
module.exports = mongoose.model('Purchase', schema);
`;

files['models/Sale.js'] = `
const mongoose = require('mongoose');
const schema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flower' },
  quantity: { type: Number, required: true },
  totalAmount: { type: Number, required: true }
}, { timestamps: true });
module.exports = mongoose.model('Sale', schema);
`;

// Controllers
files['controllers/authController.js'] = `
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    const user = await User.create({ name, email, password });
    if (user) {
      res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(\`Mock OTP for \${email}: \${otp}\`);
    
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();
    
    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
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
`;

files['controllers/purchaseController.js'] = `
const Purchase = require('../models/Purchase');
const Stock = require('../models/Stock');
const Wholesaler = require('../models/Wholesaler');

exports.create = async (req, res) => {
  try {
    const { wholesalerId, flowerId, quantity, totalAmount } = req.body;
    const purchase = await Purchase.create({
      userId: req.user._id, wholesalerId, flowerId, quantity, totalAmount
    });
    
    // Increase Stock
    let stock = await Stock.findOne({ userId: req.user._id, flowerId });
    if (stock) {
      stock.quantity += Number(quantity);
      await stock.save();
    } else {
      await Stock.create({ userId: req.user._id, flowerId, quantity });
    }
    
    // Add to Wholesaler pending amount
    if (wholesalerId) {
      let wholesaler = await Wholesaler.findOne({ _id: wholesalerId, userId: req.user._id });
      if (wholesaler) {
        wholesaler.pendingAmount += Number(totalAmount);
        await wholesaler.save();
      }
    }
    
    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const items = await Purchase.find({ userId: req.user._id });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
`;

files['controllers/salesController.js'] = `
const Sale = require('../models/Sale');
const Stock = require('../models/Stock');

exports.create = async (req, res) => {
  try {
    const { flowerId, quantity, totalAmount } = req.body;
    
    // Check Stock
    let stock = await Stock.findOne({ userId: req.user._id, flowerId });
    if (!stock || stock.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }
    
    const sale = await Sale.create({
      userId: req.user._id, flowerId, quantity, totalAmount
    });
    
    // Decrease Stock
    stock.quantity -= Number(quantity);
    await stock.save();
    
    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const items = await Sale.find({ userId: req.user._id });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
`;

const cruds = ['flower', 'stock', 'order', 'expense', 'labour', 'wholesaler', 'payment', 'profile'];
cruds.forEach(crud => {
  const ModelName = crud.charAt(0).toUpperCase() + crud.slice(1);
  files[\`controllers/\${crud}Controller.js\`] = \`
const \${ModelName} = require('../models/\${ModelName}');

exports.create = async (req, res) => {
  try {
    const item = await \${ModelName}.create({ ...req.body, userId: req.user._id });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const items = await \${ModelName}.find({ userId: req.user._id });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await \${ModelName}.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await \${ModelName}.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
\`;
});

// Routes
files['routes/authRoutes.js'] = `
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
`;

const routeFiles = ['purchase', 'sales', 'flower', 'stock', 'order', 'expense', 'labour', 'wholesaler', 'payment', 'profile'];
routeFiles.forEach(r => {
  files[\`routes/\${r}Routes.js\`] = \`
const express = require('express');
const router = express.Router();
const { create, getAll\${r !== 'purchase' && r !== 'sales' ? ', update, remove' : ''} } = require('../controllers/\${r}Controller');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, create)
  .get(protect, getAll);

\${r !== 'purchase' && r !== 'sales' ? \`
router.route('/:id')
  .put(protect, update)
  .delete(protect, remove);
\` : ''}

module.exports = router;
\`;
});

for (const [filePath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(baseDir, filePath), content.trim());
}

console.log('All files created successfully!');
