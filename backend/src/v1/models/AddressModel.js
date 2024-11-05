const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name_address: {
        type: String,
        required: true
    },
    address_label: {
        type: String,
        default: 'Home'
    },
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String
    },
    postal_code: {
        type: String,
    },
    country: {
        type: String,
        required: true
    },
    is_default: {
        type: Boolean,
        default: false
    }
}, { timestamps: true }
);

module.exports = mongoose.model('Address', addressSchema);
