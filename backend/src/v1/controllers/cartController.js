const catchAsyncError = require('../middlewares/catchAsyncError');
const User = require('../models/UserModel');
const Product = require('../models/ProductModel');
const Cart = require('../models/CartModel');

const createCart = catchAsyncError(async (req, res, next) => {
    const userId = req.user._id;
    console.log('userId', userId)
    const { products } = req.body;

    try {
        let totalPrice = 0;
        const cartProducts = await Promise.all(products.map(async item => {
            const product = await Product.findById(item.product);
            if (!product) {
                throw new Error(`Product with ID ${item.product} not found`);
            }

            const productTotal = product.price * item.quantity;
            totalPrice += productTotal;

            return {
                product: item.product,
                quantity: item.quantity
            };
        }));

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({
                user: userId,
                products: cartProducts,
                total_price: totalPrice
            });
        } else {
            cartProducts.forEach(newProduct => {
                const existingProductIndex = cart.products.findIndex(item => item.product.toString() === newProduct.product);
                if (existingProductIndex > -1) {
                    cart.products[existingProductIndex].quantity += newProduct.quantity;
                } else {
                    cart.products.push(newProduct);
                }
            });

            cart.total_price += totalPrice;
        }

        const savedCart = await cart.save();

        await User.findByIdAndUpdate(userId, { $addToSet: { cart: savedCart._id } });

        res.status(200).json(savedCart);
    } catch (error) {
        console.error("Error creating or updating cart:", error.message);
        res.status(500).json({ error: "Failed to create or update cart" });
    }
});

const getCart = catchAsyncError(async (req, res, next) => {
    const userId = req.user._id;

    try {
        const cart = await Cart.findOne({ user: userId }).populate('products.product');

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error("Error retrieving cart:", error.message);
        res.status(500).json({ error: "Failed to retrieve cart" });
    }
});

const deleteCart = catchAsyncError(async (req, res, next) => {
    const userId = req.user._id;
    const { productId } = req.params;

    try {
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const productIndex = cart.products.findIndex(item => item.product.toString() === productId);

        if (productIndex === -1) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const productQuantity = cart.products[productIndex].quantity;
        const productTotalPrice = product.price * productQuantity;

        cart.total_price -= productTotalPrice; // Giảm tổng giá của giỏ hàng
        cart.products.splice(productIndex, 1); // Xóa sản phẩm khỏi giỏ hàng

        await cart.save();

        res.status(200).json({ message: "Product removed from cart successfully", cart });
    } catch (error) {
        console.error("Error deleting product from cart:", error.message);
        res.status(500).json({ error: "Failed to delete product from cart" });
    }
});

module.exports = {
    createCart,
    getCart,
    deleteCart
};
