const Order = require('../models/OrderModel');
const Cart = require('../models/CartModel');
const Coupon = require('../models/CouponModel')

const createOrderFromCart = async (req, res) => {
    const userId = req.user._id;
    const selectedProducts = req.body.selectedProducts;
    const couponId = req.body.coupon;

    try {
        const cart = await Cart.findOne({ user: userId }).populate('products.product');

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found for this user.' });
        }

        const products = [];
        let totalAmount = 0;

        for (const item of selectedProducts) {
            const cartItem = cart.products.find(product => product.product._id.toString() === item.productId);

            if (cartItem) {
                const quantity = item.quantity;

                if (quantity > cartItem.quantity) {
                    return res.status(400).json({ message: `Requested quantity for product ${item.productId} exceeds available quantity in cart.` });
                }

                products.push({
                    product: cartItem.product._id,
                    quantity: quantity,
                    price: cartItem.product.price * quantity
                });

                totalAmount += cartItem.product.price * quantity;
            }
        }

        let discount = 0;
        if (couponId) {
            const coupon = await Coupon.findById(couponId);
            const now = new Date();

            if (coupon) {
                if (now >= coupon.start_date && now <= coupon.expiration_date) {
                    discount = coupon.discount;
                    const discountAmount = (totalAmount * discount) / 100;
                    totalAmount -= discountAmount;
                } else {
                    return res.status(400).json({ message: 'Coupon is not active.' });
                }
            } else {
                return res.status(404).json({ message: 'Coupon not found.' });
            }
        }

        const newOrder = new Order({
            user: userId,
            products: products,
            shipping_address: req.body.shipping_address,
            total_amount: totalAmount < 0 ? 0 : totalAmount,
            payment_status: 'pending',
            order_status: 'pending',
            coupon: couponId
        });

        const savedOrder = await newOrder.save();

        for (const item of selectedProducts) {
            const cartItem = cart.products.find(product => product.product._id.toString() === item.productId);
            if (cartItem) {
                cartItem.quantity -= item.quantity;
                if (cartItem.quantity <= 0) {
                    cart.products = cart.products.filter(product => product.product._id.toString() !== item.productId);
                }
            }
        }

        cart.total_price -= totalAmount;
        await cart.save();

        res.status(201).json({ order: savedOrder });
    } catch (error) {
        console.error('Error creating order:', error.message);
        res.status(500).json({ error: 'Failed to create order' });
    }
};

const deleteOrder = async (req, res) => {
    const orderId = req.params.orderId;
    const userId = req.user._id;

    try {
        const order = await Order.findOne({ _id: orderId, user: userId });

        if (!order) {
            return res.status(404).json({ message: 'Order not found or does not belong to this user.' });
        }

        await Order.deleteOne({ _id: orderId });

        for (const item of order.products) {
            const cartItem = await Cart.findOne({ user: userId });
            if (cartItem) {
                const existingProduct = cartItem.products.find(p => p.product.toString() === item.product.toString());
                if (existingProduct) {
                    existingProduct.quantity += item.quantity;
                } else {
                    cartItem.products.push({ product: item.product, quantity: item.quantity });
                }
                await cartItem.save();
            }
        }

        res.status(200).json({ message: 'Order deleted successfully.' });
    } catch (error) {
        console.error('Error deleting order:', error.message);
        res.status(500).json({ error: 'Failed to delete order.' });
    }
};

const getOrderDetail = async (req, res) => {
    const orderId = req.params.orderId;
    const userId = req.user._id;

    try {
        const query = { _id: orderId };
        if (req.user.role !== 'admin' || req.user.role !== 'vendor') {
            query.user = userId;
        }

        const order = await Order.findOne(query)
            .populate('products.product')
            .populate('shipping_address')
            .populate('coupon');

        if (!order) {
            return res.status(404).json({ message: 'Order not found or does not belong to this user.' });
        }

        res.status(200).json({ order });
    } catch (error) {
        console.error('Error fetching order:', error.message);
        res.status(500).json({ error: 'Failed to fetch order.' });
    }
};

const getOrdersByUser = async (req, res) => {
    const userId = req.user._id;

    let query = {};
    if (req.user.role !== 'admin') {
        query.user = userId;
    }

    try {
        const orders = await Order.find(query)
            .select('_id products')
            .populate({
                path: 'products.product',
                select: 'name'
            })
            .sort({ order_date: -1 });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this user.' });
        }

        const simplifiedOrders = orders.map(order => ({
            orderId: order._id,
            products: order.products.map(item => ({
                name: item.product.name,
                quantity: item.quantity
            }))
        }));

        res.status(200).json({ orders: simplifiedOrders });
    } catch (error) {
        console.error('Error fetching orders:', error.message);
        res.status(500).json({ error: 'Failed to fetch orders.' });
    }
};

const getAllOrders = async (req, res) => {
    try {
        let query = {};

        if (req.user.role !== 'admin') {
            query.user = req.user._id;
        }

        const orders = await Order.find(query)
            .populate({
                path: 'products.product',
                select: 'name'
            })
            .populate('user', 'name')
            .populate('shipping_address', 'address')
            .populate('coupon', 'code discount')
            .sort({ order_date: -1 });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found.' });
        }

        const simplifiedOrders = orders.map(order => ({
            orderId: order._id,
            userName: order.user?.name || 'N/A',
            shippingAddress: order.shipping_address?.address || 'N/A',
            products: order.products.map(item => ({
                name: item.product.name,
                quantity: item.quantity
            })),
            totalAmount: order.total_amount,
            orderStatus: order.order_status,
            paymentStatus: order.payment_status,
            coupon: order.coupon ? {
                code: order.coupon.code,
                discount: order.coupon.discount
            } : null,
            orderDate: order.order_date
        }));

        res.status(200).json({ orders: simplifiedOrders });
    } catch (error) {
        console.error('Error fetching all orders:', error.message);
        res.status(500).json({ error: 'Failed to fetch orders.' });
    }
};

module.exports = {
    createOrderFromCart,
    deleteOrder,
    getOrderDetail,
    getOrdersByUser,
    getAllOrders
}