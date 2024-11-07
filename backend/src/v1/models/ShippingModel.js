const mongoose = require('mongoose');

const shippingSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    shipping_date: {
        type: Date, default: Date.now
    },
    estimated_delivery: {
        type: Date,
        required: true
    },
    carrier: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['shipped', 'in transit', 'delivered', 'failure'],
        default: 'shipped'
    }
}, { timestamps: true }
);

module.exports = mongoose.model('Shipping', shippingSchema);