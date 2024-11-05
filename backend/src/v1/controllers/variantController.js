const VariantModel = require('../models/VariantModel');
const ProductModel = require('../models/ProductModel');
const catchAsyncError = require('../middlewares/catchAsyncError');

const createVariant = catchAsyncError(async (req, res, next) => {
    try {
        const { productId, colors, sizes, styles, price, stock } = req.body;

        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        const newVariant = new VariantModel({
            product: productId,
            colors,
            sizes,
            styles,
            price,
            stock
        });

        await newVariant.save();

        res.status(201).json({
            success: true,
            message: 'Variant created successfully',
            variant: newVariant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating variant',
            error: error.message
        });
    }
});

const updateVariant = catchAsyncError(async (req, res, next) => {
    try {
        const variantId = req.params.variantId

        const variant = await VariantModel.findById(variantId);
        if (!variant) {
            return res.status(404).json({
                success: false,
                message: 'variant not found',
            });
        }

        const updateVariant = await VariantModel.findByIdAndUpdate(variantId, req.body, { new: true })

        res.status(201).json({
            success: true,
            message: 'Variant created successfully',
            variant: updateVariant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating variant',
            error: error.message
        });
    }
});

const getAllVariant = catchAsyncError(async (req, res, next) => {
    try {
        const variants = await VariantModel.find({});
        if (!variants || variants.length == 0) {
            return res.status(404).json({
                success: false,
                message: 'variant not found',
            });
        }

        res.status(201).json({
            success: true,
            message: 'Variant get successfully',
            variant: variants,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error get variant',
            error: error.message
        });
    }
});

const getDetailVariant = catchAsyncError(async (req, res, next) => {
    try {
        const variantId = req.params.variantId
        const variant = await VariantModel.findById(variantId);
        if (!variant || variant.length == 0) {
            return res.status(404).json({
                success: false,
                message: 'variant not found',
            });
        }

        const product = await ProductModel.findById(variant.product)

        res.status(201).json({
            success: true,
            message: 'Variant get successfully',
            variant: variant,
            product: product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error get variant',
            error: error.message
        });
    }
});

const deleteVariant = catchAsyncError(async (req, res, next) => {
    try {
        const variantId = req.params.variantId
        const variant = await VariantModel.findById(variantId);
        if (!variant || variant.length == 0) {
            return res.status(404).json({
                success: false,
                message: 'variant not found',
            });
        }

        await VariantModel.findByIdAndDelete(variantId)

        res.status(201).json({
            success: true,
            message: 'Variant delete successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error delete variant',
            error: error.message
        });
    }
});

module.exports = {
    createVariant,
    updateVariant,
    getAllVariant,
    getDetailVariant,
    deleteVariant
};
