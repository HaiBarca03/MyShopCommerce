const catchAsyncError = require('../middlewares/catchAsyncError')
const CategoryModel = require('../models/CategoryModel')

const createCategory = catchAsyncError(async (req, res, next) => {
    try {
        const { name, description } = req.body;

        const category = new CategoryModel({
            name,
            description
        });

        await category.save();

        res.status(201).json({
            message: 'Category created successfully',
            category
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating category',
            error: error.message
        });
    }
});

const updateCategory = catchAsyncError(async (req, res, next) => {
    try {
        const categoryId = req.params.categoryId;

        const category = await CategoryModel.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }

        const updatedCategory = await CategoryModel.findByIdAndUpdate(categoryId, req.body, { new: true });

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            category: updatedCategory
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating category',
            error: error.message
        });
    }
});

const getAllCategory = catchAsyncError(async (req, res, next) => {
    try {
        const categories = await CategoryModel.find({});

        if (!categories || categories.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No categories found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Categories retrieved successfully',
            categories: categories
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving categories',
            error: error.message
        });
    }
});

const deleteCategory = catchAsyncError(async (req, res, next) => {
    try {
        const categoryId = req.params.categoryId;
        const categories = await CategoryModel.findById(categoryId);

        if (!categories || categories.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No categories found',
            });
        }

        const deleteCategory = await CategoryModel.findByIdAndDelete(categoryId);

        res.status(200).json({
            success: true,
            message: 'Categories deleted successfully',
            categories: deleteCategory
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving categories',
            error: error.message
        });
    }
})

module.exports = { createCategory, updateCategory, getAllCategory, deleteCategory }