// Fashion Shop Backend - ALL TASKS 1.1-1.10
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

console.log('🚀 Starting Fashion Shop Backend...');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/fashion_shop')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB error:', err.message));

// FashionShop Model
const FashionShop = mongoose.model('FashionShop', new mongoose.Schema({}, { 
  collection: 'FashionShopData', 
  strict: false 
}));

// ========== ALL REQUIRED ROUTES ==========

// Route 1: Main API
app.get('/', (req, res) => {
  res.json({ 
    message: 'Fashion Shop API Server - ALL ENDPOINTS WORKING!',
    endpoints: {
      'Task 1.8': 'GET /api/products/season-totals/:season',
      'Task 1.9': 'GET /api/products/high-sales/:season/:minUnits', 
      'Task 1.10': 'GET /api/products/rating/:season/:condition/:value'
    }
  });
});

// Task 1.8: Season totals
app.get('/api/products/season-totals/:season', async (req, res) => {
  try {
    const { season } = req.params;
    
    const result = await FashionShop.aggregate([
      { $match: { season: season } },
      {
        $group: {
          _id: '$season',
          totalUnitsSold: { $sum: '$unitsSold' },
          totalReturns: { $sum: '$returns' },
          totalRevenue: { $sum: '$revenue' },
          productCount: { $sum: 1 }
        }
      }
    ]);

    if (result.length === 0) {
      return res.json({
        season: season,
        totalUnitsSold: 0,
        totalReturns: 0,
        totalRevenue: 0,
        productCount: 0
      });
    }

    res.json({
      season: result[0]._id,
      totalUnitsSold: result[0].totalUnitsSold,
      totalReturns: result[0].totalReturns,
      totalRevenue: result[0].totalRevenue,
      productCount: result[0].productCount
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Task 1.9: High sales products
app.get('/api/products/high-sales/:season/:minUnits', async (req, res) => {
  try {
    const { season, minUnits } = req.params;
    
    const products = await FashionShop.find({
      season: season,
      unitsSold: { $gt: parseInt(minUnits) }
    })
    .sort({ unitsSold: -1 })
    .limit(10);

    res.json({
      season: season,
      minUnits: parseInt(minUnits),
      count: products.length,
      products: products
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Task 1.10: Rating filter
app.get('/api/products/rating/:season/:condition/:value', async (req, res) => {
  try {
    const { season, condition, value } = req.params;
    const ratingValue = parseFloat(value);

    let ratingQuery = {};
    switch (condition) {
      case 'greater':
        ratingQuery = { $gt: ratingValue };
        break;
      case 'less':
        ratingQuery = { $lt: ratingValue };
        break;
      case 'equal':
        ratingQuery = ratingValue;
        break;
      default:
        return res.status(400).json({
          error: 'Condition must be: greater, less, or equal'
        });
    }

    const products = await FashionShop.find({
      season: season,
      customerRating: ratingQuery
    }).sort({ customerRating: -1 });

    res.json({
      season: season,
      condition: condition,
      ratingValue: ratingValue,
      count: products.length,
      products: products
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('🎉 All Backend Tasks 1.1-1.10 Complete!');
  console.log('📚 Test these endpoints:');
  console.log('   1. http://localhost:3001');
  console.log('   2. http://localhost:3001/api/products/season-totals/Summer');
  console.log('   3. http://localhost:3001/api/products/high-sales/Summer/100');
  console.log('   4. http://localhost:3001/api/products/rating/Summer/greater/4.0');
});