const catchAsyncError = require('../middlewares/catchAsyncError')
const UserModel = require('../models/UserModel')
const wishModel = require('../models/WishlistModel')
const ProductModel = require('../models/ProductModel')

const addWish = catchAsyncError(async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { products } = req.body;

        if (!products || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Products and userId are required',
            });
        }

        let wish = await wishModel.findOne({ user: userId });

        if (!wish) {
            wish = new wishModel({
                user: userId,
                products: [],
            });
        }

        wish.products = [...new Set([...wish.products, ...products])];
        const savedWish = await wish.save();

        await UserModel.findByIdAndUpdate(
            userId,
            { $addToSet: { wishlist: { $each: products } } },
            { new: true }
        ).populate('wishlist');

        return res.status(201).json({
            success: true,
            message: 'Wish updated successfully',
            wish: savedWish,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding to wish',
            error: error.message,
        });
    }
});

const getWishByUser = catchAsyncError(async (req, res, next) => {
    try {
        const userId = req.user._id.toString();

        const getWish = await wishModel.find({ user: userId })
            .populate({
                path: 'products',
                model: 'Product',
                select: 'name price images category'
            });

        if (!getWish || getWish.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No wishlist found for this user'
            });
        }

        res.status(200).json({
            success: true,
            message: `Wish list retrieved successfully for user`,
            wishList: getWish
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving wishlist',
            error: error.message
        });
    }
});

const getAllWish = catchAsyncError(async (req, res, next) => {
    try {
        const allWish = await wishModel.find({});

        if (!allWish || allWish.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No Wish found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'All Wish retrieved successfully',
            wishList: allWish
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving wish',
            error: error.message
        });
    }
});

const deleteWishesByUser = catchAsyncError(async (req, res, next) => {
    try {
        const userId = req.user._id;

        const deletedWishes = await wishModel.deleteMany({ user: userId });

        if (deletedWishes.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'No wishes found for this user',
            });
        }

        await UserModel.findByIdAndUpdate(
            userId,
            { $set: { wishlist: [] } },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'All wishes deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting wishes',
            error: error.message,
        });
    }
});

const deleteProductFromWish = catchAsyncError(async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const { productId } = req.params;

        const wish = await wishModel.findOne({ user: userId, products: productId });

        if (!wish) {
            return res.status(404).json({
                success: false,
                message: 'No wish found containing this product',
            });
        }

        await wishModel.findByIdAndUpdate(
            wish._id,
            { $pull: { products: productId } },
            { new: true }
        );

        await UserModel.findByIdAndUpdate(
            userId,
            { $pull: { wishlist: productId } },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Product deleted from wish successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting product from wish',
            error: error.message,
        });
    }
});

module.exports = {
    addWish,
    getWishByUser,
    getAllWish,
    deleteWishesByUser,
    deleteProductFromWish
}