const Review = require('../models/ReviewModel');
const Order = require('../models/OrderModel');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        console.log('req.body', req.body)
        const productId = req.params.productId;
        console.log('productId', productId)
        const userId = req.user._id;
        console.log('userId', userId)

        const hasPurchasedProduct = await Order.exists({
            user: userId,
            order_status: 'delivered',
            'products.product': productId
        });

        console.log('hasPurchasedProduct', hasPurchasedProduct)

        if (!hasPurchasedProduct) {
            return res.status(403).json({ message: 'You can only review products you have purchased and received.' });
        }

        let imagesLinks = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'reviews',
                });

                imagesLinks.push({
                    public_id: result.public_id,
                    url: result.secure_url,
                });

                fs.unlinkSync(file.path);
            }
        }

        const reviewData = {
            user: userId,
            product: productId,
            rating,
            comment,
            images: imagesLinks
        };

        const newProduct = await Review.create(reviewData);
        console.log('review', newProduct)

        res.status(201).json({
            message: 'Review created successfully',
            review: newProduct
        });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'An error occurred while creating the review.' });
    }
}

const getDetailReviews = async (req, res) => {
    try {
        const reviewId = req.params.reviewId;

        const review = await Review.findById(reviewId)
            .populate('user', 'name email')
            .populate('product', 'name price');

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.status(200).json({
            message: 'Review details fetched successfully',
            review
        });
    } catch (error) {
        console.error('Error fetching review details:', error);
        res.status(500).json({ message: 'An error occurred while fetching review details.' });
    }
};

const getReviewsByProduct = async (req, res) => {
    try {
        const productId = req.params.productId;

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required.' });
        }

        const reviews = await Review.find({ product: productId })
            .populate('user', 'name email')
            .populate('product', 'name price')
            .sort({ createdAt: -1 });

        if (reviews.length === 0) {
            return res.status(200).json({ message: 'No reviews found for this product.' });
        }

        res.status(200).json({
            message: 'Reviews fetched successfully',
            reviews
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'An error occurred while fetching reviews.' });
    }
};

const updateReview = async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        console.log('reviewId', reviewId)
        const { rating, comment } = req.body;
        console.log('req.body', req.body)
        const userId = req.user._id;

        const review = await Review.findOne({ _id: reviewId, user: userId });
        if (!review) {
            return res.status(404).json({ message: 'Review not found or you do not have permission to update this review.' });
        }

        if (rating) review.rating = rating;
        if (comment) review.comment = comment;

        await review.save();

        res.status(200).json({
            message: 'Review updated successfully',
            review
        });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ message: 'An error occurred while updating the review.' });
    }
};

const deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        console.log('reviewId', reviewId)
        const userId = req.user._id;

        const review = await Review.findOne({ _id: reviewId, user: userId });
        if (!review) {
            return res.status(404).json({ message: 'Review not found or you do not have permission to delete this review.' });
        }

        if (review.images && review.images.length > 0) {
            for (const image of review.images) {
                await cloudinary.uploader.destroy(image.public_id);
            }
        }

        await Review.findByIdAndDelete(reviewId);

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'An error occurred while deleting the review.' });
    }
};

module.exports = {
    createReview,
    getDetailReviews,
    getReviewsByProduct,
    updateReview,
    deleteReview
};
