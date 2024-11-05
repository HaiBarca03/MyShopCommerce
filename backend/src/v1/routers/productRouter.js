const express = require('express')
const {
    createProduct,
    getAllProducts,
    getProductDetails,
    updateProduct,
    deleteProduct,
    deleteImageFromProduct,
    getAllProductsByCategory
} = require('../controllers/productController')

const { authorizeUser, isAdmin, isVendor, isAdminVendor } = require('../middlewares/auth')
const { uploadImages } = require('../middlewares/uploadCloudinary')

const productRouter = express.Router()

productRouter.post('/create-product', isAdminVendor, uploadImages, createProduct)
productRouter.get('/get-all-product', getAllProducts)
productRouter.get('/get-product-detail/:id', getProductDetails)
productRouter.put('/update-product/:id', isAdminVendor, uploadImages, updateProduct)
productRouter.delete('/delete-product/:id', isAdminVendor, uploadImages, deleteProduct)
productRouter.delete('/delete-image-product/:productId/:imageId', isAdminVendor, uploadImages, deleteImageFromProduct)
productRouter.get('/get-product-by-category/:categoryId', getAllProductsByCategory)

module.exports = productRouter