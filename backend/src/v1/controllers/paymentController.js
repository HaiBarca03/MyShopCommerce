const Payment = require('../models/PaymentModel');
const Order = require('../models/OrderModel');
const axios = require('axios');
const crypto = require('crypto');
const https = require('https');
const config = require('../../config/config');
const { console } = require('inspector');

const createPaymentOnDelivery = async (req, res) => {
    const orderId = req.params.orderId;
    const userId = req.user._id;
    try {
        const order = await Order.findOne({ _id: orderId, user: userId });

        if (!order) {
            console.log("Order not found for the specified user.");
            return res.status(404).json({ message: "Order not found for the specified user." });
        }

        const paymentMethod = 'Khi nhận hàng';
        const paymentStatus = paymentMethod === 'Khi nhận hàng' ? 'completed' : 'pending';

        const newPayment = new Payment({
            user: userId,
            order: orderId,
            amount: order.total_amount,
            payment_method: paymentMethod,
            status: paymentStatus
        });

        const savedPayment = await newPayment.save();

        if (paymentStatus === 'completed') {
            order.payment_status = 'completed';
            order.order_status = 'shipping';
            const updatedOrder = await order.save();
            return res.status(201).json({ message: "Payment created and order updated to completed.", payment: savedPayment, order: updatedOrder });
        } else {
            return res.status(201).json({ message: "Payment created with pending status.", payment: savedPayment, order });
        }

    } catch (error) {
        console.error("Error creating payment and updating order status:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const createPaymentMomo = async (req, res) => {
    const orderId = req.params.orderId;
    console.log('orderId', orderId)
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
        return res.status(404).json({ message: 'Order not found for this user' });
    }
    console.log('order', order)
    const amount = order.total_amount;
    console.log('amount', amount)

    let {
        accessKey,
        secretKey,
        orderInfo,
        partnerCode,
        redirectUrl,
        ipnUrl,
        requestType,
        extraData,
        orderGroupId,
        autoCapture,
        lang,
    } = config;

    var requestId = orderId;

    var rawSignature =
        'accessKey=' +
        accessKey +
        '&amount=' +
        amount +
        '&extraData=' +
        extraData +
        '&ipnUrl=' +
        ipnUrl +
        '&orderId=' +
        orderId +
        '&orderInfo=' +
        orderInfo +
        '&partnerCode=' +
        partnerCode +
        '&redirectUrl=' +
        redirectUrl +
        '&requestId=' +
        requestId +
        '&requestType=' +
        requestType;

    var signature = crypto
        .createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');

    const requestBody = JSON.stringify({
        partnerCode: partnerCode,
        partnerName: 'Test',
        storeId: 'MomoTestStore',
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        lang: lang,
        requestType: requestType,
        autoCapture: autoCapture,
        extraData: extraData,
        orderGroupId: orderGroupId,
        signature: signature,
    });

    const options = {
        method: 'POST',
        url: 'https://test-payment.momo.vn/v2/gateway/api/create',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody),
        },
        data: requestBody,
    };

    try {
        const result = await axios(options);

        const paymentStatus = result.data.resultCode === 0 ? 'completed' : 'pending';
        const paymentMethod = 'Momo';

        const newPayment = new Payment({
            user: userId,
            order: orderId,
            amount: order.total_amount,
            payment_method: paymentMethod,
            status: paymentStatus,
        });

        const savedPayment = await newPayment.save();

        if (paymentStatus === 'completed') {
            order.payment_status = 'completed';
            order.order_status = 'shipping';
            const updatedOrder = await order.save();
            return res.status(201).json({
                message: "Payment created and order updated to completed.",
                payment: savedPayment,
                order: updatedOrder
            });
        } else {
            return res.status(201).json({
                message: "Payment created with pending status.",
                payment: savedPayment,
                order
            });
        }
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: error.message });
    }
};

const callback = async (req, res) => {
    console.log('callback: ');
    console.log(req.body);
    return res.status(204).json(req.body);
}

const checkStatus = async (req, res) => {
    const { orderId } = req.body;

    var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    var accessKey = 'F8BBA842ECF85';
    const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`;

    const signature = crypto
        .createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');

    const requestBody = JSON.stringify({
        partnerCode: 'MOMO',
        requestId: orderId,
        orderId: orderId,
        signature: signature,
        lang: 'vi',
    });

    const options = {
        method: 'POST',
        url: 'https://test-payment.momo.vn/v2/gateway/api/query',
        headers: {
            'Content-Type': 'application/json',
        },
        data: requestBody,
    };

    const result = await axios(options);

    return res.status(200).json(result.data);
}

module.exports = { createPaymentOnDelivery, createPaymentMomo, checkStatus, callback };
