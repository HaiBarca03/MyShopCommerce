const express = require('express');
const {
    addWish,
    getWishByUser,
    getAllWish,
    deleteWishesByUser,
    deleteProductFromWish
} = require('../controllers/wishController');
const { authorizeUser, isAdmin, isVendor, isAdminVendor, isAdminUser } = require('../middlewares/auth')

const addressRouter = express.Router();

addressRouter.post('/add-wish', authorizeUser, addWish);
addressRouter.get('/get-wish-user', authorizeUser, getWishByUser);
addressRouter.get('/get-all-wish', isAdminVendor, getAllWish);
addressRouter.delete('/delete-wish-user', authorizeUser, deleteWishesByUser);
addressRouter.delete('/delete-product-wish/:productId', authorizeUser, deleteProductFromWish);

module.exports = addressRouter;