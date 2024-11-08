const express = require('express')
const { createReview, getDetailReviews, getReviewsByProduct, updateReview, deleteReview } = require('../controllers/reviewController')
const { authorizeUser, isAdmin, isVendor, isAdminVendor } = require('../middlewares/auth')
const { uploadImages } = require('../middlewares/uploadCloudinary')

const reviewsRouter = express.Router()
reviewsRouter.post('/add-review/:productId', authorizeUser, uploadImages, createReview)
reviewsRouter.get('/get-review-detail/:reviewId', getDetailReviews)
reviewsRouter.get('/get-product-review/:productId', getReviewsByProduct)
reviewsRouter.put('/update-review/:reviewId', authorizeUser, updateReview)
reviewsRouter.delete('/delete-review/:reviewId', authorizeUser, deleteReview)

module.exports = reviewsRouter