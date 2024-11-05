const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }],
    quantity_sold: {
        type: Number,
        required: true
    },
    sale_date: {
        type: Date,
        required: true
    },
    start_time: {
        type: Date,
        required: true
    },
    end_time: {
        type: Date,
        required: true
    },
    sale_duration: {
        type: Number,
        required: true
    },
    total_price: {
        type: Number,
        required: true
    }
}, { timestamps: true });

saleSchema.pre('save', function (next) {
    if (this.isModified('start_time') || this.isModified('sale_duration')) {
        this.end_time = new Date(this.start_time.getTime() + this.sale_duration * 60000);
    }
    next();
});

module.exports = mongoose.model('Sale', saleSchema);
