const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Product = require('./models/Product');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB - REMOVED OLD OPTIONS
mongoose.connect('mongodb://localhost:27017/fashionShopDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// ========== TASK 1.5: POST - Add Product ==========
app.post('/api/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        
        res.status(201).json({
            success: true,
            message: '✅ Product added successfully (Task 1.5)',
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// ========== TASK 1.6: POST - Update Product ==========
app.post('/api/products/update/:productName', async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { productName: req.params.productName },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: `Product "${req.params.productName}" not found`
            });
        }
        
        res.json({
            success: true,
            message: '✅ Product updated successfully (Task 1.6)',
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// ========== TASK 1.7: POST - Delete Product ==========
app.post('/api/products/delete/:productName', async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ 
            productName: req.params.productName 
        });
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: `Product "${req.params.productName}" not found`
            });
        }
        
        res.json({
            success: true,
            message: '✅ Product deleted successfully (Task 1.7)',
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// ========== TASK 1.8: GET - Season Totals ==========
app.get('/api/products/season-totals/:season', async (req, res) => {
    try {
        const { season } = req.params;
        
        const result = await Product.aggregate([
            { $match: { season: season } },
            { $group: {
                _id: '$season',
                totalUnitsSold: { $sum: '$unitsSold' },
                totalReturns: { $sum: '$returns' },
                totalRevenue: { $sum: '$revenue' },
                averageRating: { $avg: '$customerRating' },
                totalProducts: { $sum: 1 }
            }}
        ]);
        
        res.json({
            success: true,
            message: `✅ Season totals retrieved (Task 1.8)`,
            season: season,
            data: result[0] || {
                totalUnitsSold: 0,
                totalReturns: 0,
                totalRevenue: 0,
                averageRating: 0,
                totalProducts: 0
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// ========== TASK 1.9: GET - High Sales Filter ==========
app.get('/api/products/high-sales/:season/:minUnits', async (req, res) => {
    try {
        const { season, minUnits } = req.params;
        const minUnitsNum = parseInt(minUnits);
        
        const products = await Product.find({
            season: season,
            unitsSold: { $gt: minUnitsNum }
        })
        .sort({ unitsSold: -1 })
        .limit(10);
        
        res.json({
            success: true,
            message: `✅ High sales products retrieved (Task 1.9)`,
            season: season,
            minUnits: minUnitsNum,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// ========== TASK 1.10: GET - Rating Condition ==========
app.get('/api/products/rating/:season/:condition/:value', async (req, res) => {
    try {
        const { season, condition, value } = req.params;
        const ratingValue = parseFloat(value);
        
        let ratingQuery = {};
        switch(condition.toLowerCase()) {
            case 'greater':
                ratingQuery = { $gte: ratingValue };
                break;
            case 'less':
                ratingQuery = { $lte: ratingValue };
                break;
            case 'equal':
                ratingQuery = ratingValue;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid condition. Use: greater, less, or equal'
                });
        }
        
        const products = await Product.find({
            season: season,
            customerRating: ratingQuery
        });
        
        res.json({
            success: true,
            message: `✅ Rating filtered products retrieved (Task 1.10)`,
            season: season,
            condition: condition,
            ratingValue: ratingValue,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// ========== GET All Products (Bonus) ==========
app.get('/api/products', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const products = await Product.find().limit(limit);
        
        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// ========== Health Check ==========
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        server: 'Fashion Shop API',
        version: '1.0.0'
    });
});

// ========== Home Route ==========
app.get('/', (req, res) => {
    res.json({
        message: '🎉 Fashion Shop REST API - ALL Tasks 1.1-1.10 Complete!',
        tasks: {
            'Task 1.1': 'MongoDB collection created',
            'Task 1.2': 'Mongoose Schema created',
            'Task 1.3': 'MongoDB connection established',
            'Task 1.4': 'Express server running',
            'Task 1.5': 'POST /api/products - Add product',
            'Task 1.6': 'POST /api/products/update/:productName - Update product',
            'Task 1.7': 'POST /api/products/delete/:productName - Delete product',
            'Task 1.8': 'GET /api/products/season-totals/:season - Season totals',
            'Task 1.9': 'GET /api/products/high-sales/:season/:minUnits - High sales filter',
            'Task 1.10': 'GET /api/products/rating/:season/:condition/:value - Rating filter'
        },
        endpoints: [
            'POST   /api/products - Add product (Task 1.5)',
            'POST   /api/products/update/:productName - Update product (Task 1.6)',
            'POST   /api/products/delete/:productName - Delete product (Task 1.7)',
            'GET    /api/products/season-totals/:season - Season totals (Task 1.8)',
            'GET    /api/products/high-sales/:season/:minUnits - High sales (Task 1.9)',
            'GET    /api/products/rating/:season/:condition/:value - Rating filter (Task 1.10)',
            'GET    /api/products - Get all products',
            'GET    /health - Health check'
        ]
    });
});

// ========== Start Server ==========
app.listen(PORT, () => {
    console.log(`🚀 Starting Fashion Shop Backend...`);
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`🎉 All Backend Tasks 1.1-1.10 Complete!`);
    console.log(`📚 Test these endpoints:`);
    console.log(`   1. http://localhost:${PORT} - Home`);
    console.log(`   2. POST http://localhost:${PORT}/api/products - Add product (Task 1.5)`);
    console.log(`   3. POST http://localhost:${PORT}/api/products/update/TEST - Update product (Task 1.6)`);
    console.log(`   4. POST http://localhost:${PORT}/api/products/delete/TEST - Delete product (Task 1.7)`);
    console.log(`   5. GET http://localhost:${PORT}/api/products/season-totals/Summer (Task 1.8)`);
    console.log(`   6. GET http://localhost:${PORT}/api/products/high-sales/Summer/100 (Task 1.9)`);
    console.log(`   7. GET http://localhost:${PORT}/api/products/rating/Summer/greater/4.0 (Task 1.10)`);
    console.log(`   8. GET http://localhost:${PORT}/health - Health check`);
});
