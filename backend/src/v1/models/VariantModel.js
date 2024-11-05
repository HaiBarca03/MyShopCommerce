const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    colors: [
        {
            type: String,
            required: true
        }
    ],
    sizes: [
        {
            type: String,
            required: true
        }
    ],
    styles: [
        {
            type: String
        }
    ],
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const VariantModel = mongoose.model('Variant', variantSchema);
module.exports = VariantModel
