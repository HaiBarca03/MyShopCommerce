const catchAsyncError = require('../middlewares/catchAsyncError');
const ProductModel = require('../models/ProductModel')
const CategoryModel = require('../models/CategoryModel')
const featuresApp = require("../utils/features");
const cloudinary = require('cloudinary')
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createProduct = catchAsyncError(async (req, res, next) => {
    try {
        const { name, description, price, category, stock, variants, reviews } = req.body;

        if (!name || !price || !category || !stock) {
            return res.status(400).json({
                success: false,
                message: 'Name, price, category, and stock are required fields.',
            });
        }

        let imagesLinks = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'products',
                });

                imagesLinks.push({
                    public_id: result.public_id,
                    url: result.secure_url,
                });

                fs.unlinkSync(file.path);
            }
        }

        const productData = {
            name,
            description,
            price,
            category,
            stock,
            variants,
            reviews,
            images: imagesLinks,
        };

        const newProduct = await ProductModel.create(productData);

        res.status(201).json({
            success: true,
            message: 'Product created successfully!',
            product: newProduct,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
});

const getAllProducts = catchAsyncError(async (req, res, next) => {
    const resultPerPage = 6;
    const productsCount = await ProductModel.countDocuments();
    const appFeature = new featuresApp(ProductModel.find(), req.query)
        .search()
        .filter();
    let products = await appFeature.query.clone();
    let filteredProductsCount = products.length;
    appFeature.pagination(resultPerPage);
    products = await appFeature.query;
    res.status(200).json({
        success: true,
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount,
    });
});

const getProductDetails = catchAsyncError(async (req, res, next) => {
    const productId = req.params.id
    const product = await ProductModel.findById(productId);
    if (!product) {
        return next(new ErrorHandle("Product not found", 404));
    }
    res.status(200).json({
        success: true,
        product: product,
    });
});

const updateProduct = catchAsyncError(async (req, res, next) => {
    try {
        const productId = req.params.id;
        let product = await ProductModel.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        if (req.files && req.files.length > 0) {
            const imagesLinks = [];

            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'products',
                });

                imagesLinks.push({
                    public_id: result.public_id,
                    url: result.secure_url,
                });

                fs.unlinkSync(file.path);
            }

            product.images = [...product.images, ...imagesLinks];
        }

        Object.assign(product, req.body);

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Product updated successfully!',
            product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
});

const deleteProduct = catchAsyncError(async (req, res, next) => {
    try {
        const productId = req.params.id;
        const product = await ProductModel.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        if (product.images && product.images.length > 0) {
            for (const image of product.images) {
                await cloudinary.uploader.destroy(image.public_id);
            }
        }

        await ProductModel.findByIdAndDelete(productId);

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully!',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
});

const deleteImageFromProduct = catchAsyncError(async (req, res, next) => {
    try {
        const { productId, imageId } = req.params;

        const product = await ProductModel.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        const imageToDelete = product.images.find(img => img._id.toString() === imageId);

        if (!imageToDelete) {
            return res.status(404).json({
                success: false,
                message: 'Image not found',
            });
        }

        await cloudinary.uploader.destroy(imageToDelete.public_id);

        product.images = product.images.filter(img => img._id.toString() !== imageId);
        await product.save();

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully!',
            images: product.images,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
});

const getAllProductsByCategory = catchAsyncError(async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const resultPerPage = 5;
        const productsCount = await ProductModel.countDocuments();
        const category = await CategoryModel.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }
        const appFeature = new featuresApp(ProductModel.find({ category: categoryId }), req.query)
            .search()
            .filter();

        let products = await appFeature.query.clone();
        let filteredProductsCount = products.length;
        appFeature.pagination(resultPerPage);
        products = await appFeature.query;

        if (!products || products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No products found in this category',
            });
        }

        res.status(200).json({
            success: true,
            message: `Products retrieved for category: ${category.name}`,
            name_category: category.name,
            products: products,
            productsCount,
            resultPerPage,
            filteredProductsCount,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving products',
            error: error.message
        });
    }
});

module.exports = {
    createProduct,
    getAllProducts,
    getProductDetails,
    updateProduct,
    deleteProduct,
    deleteImageFromProduct,
    getAllProductsByCategory
}