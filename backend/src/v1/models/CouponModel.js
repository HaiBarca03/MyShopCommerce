const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
    },
    discount: {
        type: Number,
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    expiration_date: {
        type: Date,
        required: true
    },
    minimum_order_amount: {
        type: Number
    }
}, { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
