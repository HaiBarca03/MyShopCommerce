const express = require('express');
const {
    createCart,
    getCart,
    deleteCart
} = require('../controllers/cartController');
const { authorizeUser, isAdmin, isVendor, isAdminVendor, isAdminUser } = require('../middlewares/auth')

const cartRouter = express.Router();

cartRouter.post('/add-to-cart', authorizeUser, createCart);
cartRouter.get('/get-to-cart', authorizeUser, getCart);
cartRouter.delete('/delete-cart/:productId', authorizeUser, deleteCart);

module.exports = cartRouter;