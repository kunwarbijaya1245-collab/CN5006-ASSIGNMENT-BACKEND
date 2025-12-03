
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productCategory: {
        type: String,
        required: [true, 'Product category is required'],
        trim: true
    },
    productName: {
        type: String,
        required: [true, 'Product name is required'],
        unique: true,
        trim: true
    },
    unitsSold: {
        type: Number,
        required: [true, 'Units sold is required'],
        min: [0, 'Units sold cannot be negative']
    },
    returns: {
        type: Number,
        required: [true, 'Returns is required'],
        min: [0, 'Returns cannot be negative']
    },
    revenue: {
        type: Number,
        required: [true, 'Revenue is required'],
        min: [0, 'Revenue cannot be negative']
    },
    customerRating: {
        type: Number,
        required: [true, 'Customer rating is required'],
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot exceed 5']
    },
    stockLevel: {
        type: Number,
        required: [true, 'Stock level is required'],
        min: [0, 'Stock level cannot be negative']
    },
    season: {
        type: String,
        required: [true, 'Season is required'],
        enum: {
            values: ['Spring', 'Summer', 'Fall', 'Winter'],
            message: '{VALUE} is not a valid season'
        }
    },
    trendScore: {
        type: Number,
        required: [true, 'Trend score is required'],
        min: [0, 'Trend score cannot be less than 0'],
        max: [10, 'Trend score cannot exceed 10']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
