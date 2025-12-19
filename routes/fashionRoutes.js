const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// ========== TASK 1.5: ADD PRODUCT ==========
router.post('/add', async (req, res) => {
    try {
        const existing = await Product.findOne({ productName: req.body.productName });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: `Product '${req.body.productName}' already exists!`
            });
        }
        
        const product = new Product(req.body);
        await product.save();
        
        res.status(201).json({
            success: true,
            message: 'Product added successfully',
            data: product
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message;
            });
            return res.status(400).json({ success: false, errors });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ========== TASK 1.6: UPDATE PRODUCT ==========
router.post('/update', async (req, res) => {
    try {
        const { productName, ...updateData } = req.body;
        
        if (!productName) {
            return res.status(400).json({ 
                success: false, 
                message: 'Product name is required' 
            });
        }
        
        const updated = await Product.findOneAndUpdate(
            { productName },
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!updated) {
            return res.status(404).json({ 
                success: false, 
                message: `Product '${productName}' not found` 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Product updated', 
            data: updated 
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ========== TASK 1.7: DELETE PRODUCT ==========
router.post('/delete', async (req, res) => {
    try {
        const { productName } = req.body;
        
        if (!productName) {
            return res.status(400).json({ 
                success: false, 
                message: 'Product name is required' 
            });
        }
        
        const deleted = await Product.findOneAndDelete({ productName });
        
        if (!deleted) {
            return res.status(404).json({ 
                success: false, 
                message: `Product '${productName}' not found` 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Product deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ========== TASK 1.8: SEASON STATS ==========
router.get('/stats/:season', async (req, res) => {
    try {
        const { season } = req.params;
        
        const result = await Product.aggregate([
            { $match: { season } },
            { $group: {
                _id: null,
                totalUnitsSold: { $sum: "$unitsSold" },
                totalReturns: { $sum: "$returns" },
                totalRevenue: { $sum: "$revenue" }
            }}
        ]);
        
        res.json({
            success: true,
            season,
            totalUnitsSold: result[0]?.totalUnitsSold || 0,
            totalReturns: result[0]?.totalReturns || 0,
            totalRevenue: result[0]?.totalRevenue || 0
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== TASK 1.9: TOP 10 PRODUCTS ==========
router.get('/top-products', async (req, res) => {
    try {
        const { minUnits, season } = req.query;
        
        const products = await Product.find({
            unitsSold: { $gt: Number(minUnits) },
            season: season
        })
        .sort({ unitsSold: -1 })
        .limit(10);
        
        res.json({
            success: true,
            count: products.length,
            minUnits,
            season,
            products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== TASK 1.10: RATING FILTER ==========
router.get('/rating-filter', async (req, res) => {
    try {
        const { season, minRating } = req.query;
        
        const products = await Product.aggregate([
            { $match: { season } },
            { $group: {
                _id: "$productName",
                avgRating: { $avg: "$customerRating" },
                productData: { $first: "$$ROOT" }
            }},
            { $match: { avgRating: { $gte: Number(minRating) } } }
        ]);
        
        res.json({
            success: true,
            season,
            minRating,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
