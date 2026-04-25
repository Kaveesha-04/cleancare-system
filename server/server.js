require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Models
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Department = require('./models/Department');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '20kb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 300, 
  message: 'Too many requests from this IP'
});
app.use(limiter);

const JWT_SECRET = process.env.JWT_SECRET || 'cleancare_super_secure_key_2026!';

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected securely'))
  .catch(err => console.error('MongoDB connection error:', err));

// Database Initialization with Secure Seed Users
async function initDB() {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      const salt = bcrypt.genSaltSync(10);
      await User.create([
        {
          username: "store_admin",
          email: "admin@cleancaresupply.com",
          passwordHash: bcrypt.hashSync("admin123", salt),
          role: "admin",
          loyaltyPoints: 0,
          name: "Store Manager"
        },
        {
          username: "wholesale_partner",
          email: "wholesale@cleancaresupply.com",
          passwordHash: bcrypt.hashSync("wholesale123", salt),
          role: "wholesale",
          loyaltyPoints: 0,
          name: "B2B Partner"
        },
        {
          username: "val_customer",
          email: "customer@test.com",
          passwordHash: bcrypt.hashSync("password", salt),
          role: "customer",
          loyaltyPoints: 500, // Pre-seeded $5 discount
          name: "Valued Customer"
        }
      ]);
      console.log("Database initialized securely with seed users.");
    }

    const deptCount = await Department.countDocuments({});
    if (deptCount === 0) {
      await Department.create([
        { name: "Chemicals", sections: ["Floor Cleaners", "Sanitizers"] },
        { name: "Equipment", sections: ["Vacuums", "Mops"] },
        { name: "Paper Products", sections: ["Toilet Tissue", "Towels"] }
      ]);
      console.log("Database initialized with standard departments.");
    }
  } catch (error) {
    console.error("Failed to initialize database", error);
  }
}

mongoose.connection.once('open', initDB);

// -- AUTHENTICATION & SECURITY --

app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    const user = await User.findOne({ 
      $or: [{ email: identifier }, { username: identifier }] 
    });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const validPass = bcrypt.compareSync(password, user.passwordHash);
    if (!validPass) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    const safeUser = user.toObject();
    delete safeUser.passwordHash;
    res.json({ token, user: safeUser });
  } catch (error) {
    console.error("CRITICAL LOGIN SERVER ERROR:", error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/register', [
  body('username').notEmpty().withMessage('Username required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name required'),
  body('phone').notEmpty().withMessage('Phone number required'),
  body('role').isIn(['customer', 'wholesale']).withMessage('Invalid role selection')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  try {
    const { username, email, password, name, phone, role } = req.body;

    if (await User.findOne({ username })) return res.status(400).json({ error: 'Username already taken' });
    if (await User.findOne({ email })) return res.status(400).json({ error: 'Email already registered' });
    if (await User.findOne({ phone })) return res.status(400).json({ error: 'Phone number already registered' });

    const salt = bcrypt.genSaltSync(10);
    const newUser = new User({
      username,
      email,
      name,
      phone,
      role,
      passwordHash: bcrypt.hashSync(password, salt)
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    const safeUser = newUser.toObject();
    delete safeUser.passwordHash;
    res.status(201).json({ token, user: safeUser });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({error: 'No credential provided'});

    const decoded = jwt.decode(credential);
    if (!decoded || !decoded.email) return res.status(400).json({error: 'Invalid Google Identity'});

    const user = await User.findOne({ email: decoded.email });

    if (user) {
      const token = jwt.sign(
        { id: user._id, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '8h' }
      );
      const safeUser = user.toObject();
      delete safeUser.passwordHash;
      return res.json({ action: 'LOGIN_SUCCESS', token, user: safeUser });
    } else {
      return res.json({ 
        action: 'REQUIRES_REGISTRATION', 
        googleData: { email: decoded.email, name: decoded.name } 
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Google Auth Failed' });
  }
});

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authentication token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token expired or forged' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrative privileges required.' });
  }
  next();
};

// -- PUBLIC ROUTES --

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({});
    // Provide backwards compatibility for front-end expecting integer id
    const mapped = products.map(p => ({...p.toObject(), id: p._id}));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/departments', async (req, res) => {
  try {
    const departments = await Department.find({});
    res.json(departments.map(d => ({...d.toObject(), id: d._id})));
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

// -- PUBLIC PRODUCT RATINGS --
app.post('/api/products/:id/rate', async (req, res) => {
  try {
    const { rating } = req.body;
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Invalid rating. Must be 1-5.' });
    
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    // Mathematical recalculation of global rating
    const totalCurrentRating = (product.rating || 0) * (product.numReviews || 0);
    const newNumReviews = (product.numReviews || 0) + 1;
    product.rating = (totalCurrentRating + rating) / newNumReviews;
    product.numReviews = newNumReviews;
    
    await product.save();
    
    // Broadcast ping theoretically, but just return success
    res.json({ ...product.toObject(), id: product._id });
  } catch (error) {
    res.status(500).json({ error: 'Server error saving rating' });
  }
});

// -- PROTECTED POS & ADMIN ROUTES --

app.post('/api/products', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { name, department, section, price, wholesalePrice, stock, barcode, image } = req.body;
    
    if (await Product.findOne({ barcode })) {
      return res.status(400).json({ error: 'Barcode already exists' });
    }

    const newProduct = new Product({
      name,
      department: department || "General",
      section: section || "General",
      price: parseFloat(price),
      wholesalePrice: parseFloat(wholesalePrice) || parseFloat(price) * 0.8,
      stock: parseInt(stock),
      barcode,
      image: image || `https://source.unsplash.com/400x400/?${encodeURIComponent(name)}`
    });
    
    await newProduct.save();
    res.json({ ...newProduct.toObject(), id: newProduct._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.post('/api/departments', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { departmentName, sectionName } = req.body;
    if (!departmentName || departmentName.trim().length === 0) return res.status(400).json({error: 'Invalid department'});

    let dept = await Department.findOne({ name: departmentName.trim() });
    
    if (!dept) {
      dept = new Department({ name: departmentName.trim(), sections: [] });
    }
    
    if (sectionName && sectionName.trim().length > 0) {
      if (!dept.sections.includes(sectionName.trim())) {
        dept.sections.push(sectionName.trim());
      }
    }

    await dept.save();
    const departments = await Department.find({});
    res.json(departments.map(d => ({...d.toObject(), id: d._id})));
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/orders', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders.map(o => ({...o.toObject(), id: o._id})));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.put('/api/products/:id/discount', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { retailDiscount, wholesaleDiscount } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    if (retailDiscount !== undefined) product.retailDiscount = parseInt(retailDiscount) || 0;
    if (wholesaleDiscount !== undefined) product.wholesaleDiscount = parseInt(wholesaleDiscount) || 0;
    
    await product.save();
    res.json({ ...product.toObject(), id: product._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set discount' });
  }
});

app.put('/api/products/:id/stock', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    product.stock = parseInt(stock) || 0;
    await product.save();
    res.json({ ...product.toObject(), id: product._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

app.delete('/api/products/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const result = await Product.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.get('/api/products/scan/:barcode', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findOne({ barcode: req.params.barcode });
    if (product) res.json({ ...product.toObject(), id: product._id });
    else res.status(404).json({ error: 'Product not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.post('/api/checkout', [
  body('items').isArray({ min: 1 }).withMessage('Cart is empty'),
  body('paymentMethod').notEmpty().withMessage('Payment method required'),
  body('orderType').notEmpty().withMessage('Order type required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  try {
    const { items, paymentMethod, orderType, applyPoints, userId, overrideTier, manualDiscountPercent } = req.body;
    let total = 0;
    let user = null;
    let isAdmin = false;

    // Securely extract admin credentials if present for POS overrides
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const tokenStr = authHeader.split(' ')[1];
        const decoded = jwt.verify(tokenStr, process.env.JWT_SECRET || 'fallback_secret_123'); // from your config
        if (decoded.role === 'admin') isAdmin = true;
      } catch (e) { /* silent fail for public users */ }
    }

    if (userId) {
      if (mongoose.Types.ObjectId.isValid(userId)) {
        user = await User.findById(userId);
      }
    }

    // Determine active prices and total cost
    for (let item of items) {
      let productQuery;
      if (mongoose.Types.ObjectId.isValid(item.id)) productQuery = { _id: item.id };
      else productQuery = { barcode: item.barcode }; // Fallback mapping

      const product = await Product.findOne(productQuery);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ error: `Invalid item or stock: ${item.id}` });
      }
      
      const isWholesale = (isAdmin && overrideTier === 'wholesale') || (user?.role === 'wholesale');
      const activePrice = isWholesale && product.wholesalePrice ? product.wholesalePrice : product.price;
      const activeDiscount = isWholesale ? (product.wholesaleDiscount || 0) : (product.retailDiscount || 0); 
      
      const discountedPrice = activeDiscount > 0 ? activePrice * (1 - (activeDiscount / 100)) : activePrice;
      
      total += discountedPrice * item.quantity;
      product.stock -= item.quantity;
      await product.save();
    }

    // Apply Admin Manual POS Discount
    let globalAdminDiscount = 0;
    if (isAdmin && manualDiscountPercent > 0 && manualDiscountPercent <= 100) {
      globalAdminDiscount = total * (manualDiscountPercent / 100);
      total -= globalAdminDiscount;
    }

    let discount = globalAdminDiscount;
    let pointsEarned = 0;

    if (user) {
      if (applyPoints && user.loyaltyPoints >= applyPoints) {
         discount = applyPoints * 0.50;
         user.loyaltyPoints -= applyPoints;
      }
      
      const finalTotal = Math.max(0, total - discount);
      
      if (user.role === 'admin') pointsEarned = 0;
      else if (user.role === 'wholesale') pointsEarned = Math.floor(finalTotal / 500); 
      else pointsEarned = Math.floor(finalTotal / 100); 

      user.loyaltyPoints += pointsEarned;
      await user.save();
      total = finalTotal;
    }

    const newOrder = new Order({
      subtotal: total + discount,
      discountApplied: discount,
      finalTotal: total,
      pointsEarned,
      paymentMethod,
      orderType,
      items: items.map(i => ({ id: i.id, quantity: i.quantity, price: i.price, productId: mongoose.Types.ObjectId.isValid(i.id) ? i.id : null })),
      userId: user ? user._id : null
    });

    await newOrder.save();
    res.json({ success: true, orderId: newOrder._id, total, pointsEarned });
  } catch (error) {
    res.status(500).json({ error: 'Checkout failed securely' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({error: 'User not found'});
    
    const safeUser = user.toObject();
    delete safeUser.passwordHash;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({error: 'Failed to authenticate user parameters'});
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`CleanCare Supply API Server running on port ${PORT}`);
});
