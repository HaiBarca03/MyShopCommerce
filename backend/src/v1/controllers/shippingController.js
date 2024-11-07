const featuresApp = require('../utils/features');
const Order = require('../models/OrderModel');
const Shipping = require('../models/ShippingModel');
const Payment = require('../models/PaymentModel');

const createShipping = async (req, res) => {
    try {
        const { order, shipping_date, estimated_delivery, carrier, status } = req.body;

        const payment = await Payment.findOne({ order, status: 'completed' });

        if (!payment) {
            return res.status(400).json({
                message: "Shipping cannot be created. Payment for this order has not been completed."
            });
        }

        const shippingData = {
            order,
            shipping_date: shipping_date || Date.now(),
            estimated_delivery,
            carrier,
            status: status || 'shipped'
        };

        const shipping = new Shipping(shippingData);
        await shipping.save();

        res.status(201).json({
            message: "Shipping created successfully",
            shipping
        });
    } catch (error) {
        console.error("Error creating shipping:", error);

        res.status(500).json({
            message: "Failed to create shipping",
            error: error.message
        });
    }
};

const updateShipping = async (req, res) => {
    try {
        const { shippingId } = req.params;
        const { status } = req.body;

        const shipping = await Shipping.findById(shippingId);

        if (!shipping) {
            return res.status(404).json({
                message: "Shipping not found"
            });
        }

        shipping.status = status;
        await shipping.save();

        let orderStatusUpdate;
        if (status === 'delivered') {
            orderStatusUpdate = 'delivered';
        } else if (status === 'in transit') {
            orderStatusUpdate = 'shipping';
        } else if (status === 'failure') {
            orderStatusUpdate = 'canceled';
        }

        if (orderStatusUpdate) {
            await Order.findByIdAndUpdate(
                shipping.order,
                { order_status: orderStatusUpdate },
                { new: true }
            );
        }

        res.status(200).json({
            message: "Shipping updated successfully",
            shipping
        });
    } catch (error) {
        console.error("Error updating shipping:", error);

        res.status(500).json({
            message: "Failed to update shipping",
            error: error.message
        });
    }
};

const getAllShipping = async (req, res) => {
    try {
        const features = new featuresApp(Shipping.find(), req.query);

        features.search().filter();

        const shippingList = await features.query.populate('order');

        res.status(200).json({
            message: "Shipping records retrieved successfully",
            shippingList
        });
    } catch (error) {
        console.error("Error retrieving shipping records:", error);

        res.status(500).json({
            message: "Failed to retrieve shipping records",
            error: error.message
        });
    }
};

const deleteShipping = async (req, res) => {
    try {
        const { shippingId } = req.params;

        const shipping = await Shipping.findByIdAndDelete(shippingId);

        if (!shipping) {
            return res.status(404).json({
                message: "Shipping not found"
            });
        }

        res.status(200).json({
            message: "Shipping deleted successfully",
            shipping
        });
    } catch (error) {
        console.error("Error deleting shipping:", error);

        res.status(500).json({
            message: "Failed to delete shipping",
            error: error.message
        });
    }
};

const getShippingDetail = async (req, res) => {
    try {
        const { shippingId } = req.params;

        const shipping = await Shipping.findById(shippingId).populate('order');

        if (!shipping) {
            return res.status(404).json({
                message: "Shipping not found"
            });
        }

        res.status(200).json({
            message: "Shipping details retrieved successfully",
            shipping
        });
    } catch (error) {
        console.error("Error retrieving shipping details:", error);

        res.status(500).json({
            message: "Failed to retrieve shipping details",
            error: error.message
        });
    }
};

module.exports = { createShipping, updateShipping, getAllShipping, deleteShipping, getShippingDetail };