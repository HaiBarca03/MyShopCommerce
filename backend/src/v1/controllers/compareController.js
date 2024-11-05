const ProductModel = require('../models/ProductModel');
const CompareModel = require('../models/CompareModel');
const catchAsyncError = require('../middlewares/catchAsyncError');

const compareProduct = catchAsyncError(async (req, res, next) => {
    try {
        const userId = req.user._id
        const { productIdA, productIdB } = req.body;

        const productA = await ProductModel.findById(productIdA)
        const productB = await ProductModel.findById(productIdB)

        if (!productA || !productB) {
            return res.status(404).json({
                success: false,
                message: 'One or both products not found'
            });
        }

        const result = {
            betterProduct: null,
            comparisonDetails: {
                price: null,
                stock: null,
                // reviews: null,
                // rating: null
            }
        };

        if (productA.price < productB.price) {
            result.comparisonDetails.price = `Product A (${productA.name}) is cheaper than Product B (${productB.name})`;
        } else if (productA.price > productB.price) {
            result.comparisonDetails.price = `Product B (${productB.name}) is cheaper than Product A (${productA.name})`;
        } else {
            result.comparisonDetails.price = `Both products have the same price.`;
        }

        if (productA.stock > productB.stock) {
            result.comparisonDetails.stock = `Product A (${productA.name}) has more stock than Product B (${productB.name})`;
        } else if (productA.stock < productB.stock) {
            result.comparisonDetails.stock = `Product B (${productB.name}) has more stock than Product A (${productA.name})`;
        } else {
            result.comparisonDetails.stock = `Both products have the same stock level.`;
        }

        // if (productA.reviews.length > productB.reviews.length) {
        //     result.comparisonDetails.reviews = `Product A (${productA.name}) has more reviews than Product B (${productB.name})`;
        // } else if (productA.reviews.length < productB.reviews.length) {
        //     result.comparisonDetails.reviews = `Product B (${productB.name}) has more reviews than Product A (${productA.name})`;
        // } else {
        //     result.comparisonDetails.reviews = `Both products have the same number of reviews.`;
        // }

        // const getAverageRating = (reviews) => {
        //     if (reviews.length === 0) return 0;
        //     const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
        //     return totalRating / reviews.length;
        // };
        // const averageRatingA = getAverageRating(productA.reviews);
        // const averageRatingB = getAverageRating(productB.reviews);

        // if (averageRatingA > averageRatingB) {
        //     result.comparisonDetails.rating = `Product A (${productA.name}) has a higher average rating than Product B (${productB.name})`;
        // } else if (averageRatingA < averageRatingB) {
        //     result.comparisonDetails.rating = `Product B (${productB.name}) has a higher average rating than Product A (${productA.name})`;
        // } else {
        //     result.comparisonDetails.rating = `Both products have the same average rating.`;
        // }

        // const scoreA = (productA.stock * 0.3) + (averageRatingA * 0.5) + (productA.reviews.length * 0.2) - productA.price;
        const scoreA = (productA.stock * 0.3) - productA.price;
        const scoreB = (productB.stock * 0.3) - productB.price;

        result.betterProduct = scoreA > scoreB ? productA : productB;

        const newComparison = await CompareModel.create({
            user: userId,
            product_a: productIdA,
            product_b: productIdB,
            comparison_date: Date.now()
        });

        // Return the comparison result as JSON
        res.status(200).json({
            success: true,
            message: 'Comparison completed successfully',
            comparisonData: result,
            savedComparison: newComparison
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error comparing products: ${error.message}`
        });
    }
})

const updateCompare = catchAsyncError(async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { compareId, productIdA, productIdB } = req.body;

        const productA = await ProductModel.findById(productIdA);
        const productB = await ProductModel.findById(productIdB);

        if (!productA || !productB) {
            return res.status(404).json({
                success: false,
                message: 'One or both products not found'
            });
        }

        const comparison = await CompareModel.findOne({ _id: compareId, user: userId });

        if (!comparison) {
            return res.status(404).json({
                success: false,
                message: 'Comparison not found for this user'
            });
        }

        comparison.product_a = productIdA;
        comparison.product_b = productIdB;
        comparison.comparison_date = Date.now();

        const updatedComparison = await comparison.save();

        res.status(200).json({
            success: true,
            message: 'Comparison updated successfully',
            updatedComparison
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error updating comparison: ${error.message}`
        });
    }
});

const deleteCompare = catchAsyncError(async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { compareId } = req.params;
        const compare = await CompareModel.findOne({ _id: compareId, user: userId });

        if (!compare) {
            return res.status(404).json({
                success: false,
                message: 'Comparison not found for this user'
            });
        }

        await CompareModel.findByIdAndDelete(compareId);

        res.status(200).json({
            success: true,
            message: 'Comparison deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error deleting comparison: ${error.message}`
        });
    }
});

module.exports = { compareProduct, updateCompare, deleteCompare };
