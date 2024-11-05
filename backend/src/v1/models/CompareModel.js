const mongoose = require('mongoose');

const compareSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product_a: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    product_b: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    comparison_date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true }
);

module.exports = mongoose.model('Compare', compareSchema);
