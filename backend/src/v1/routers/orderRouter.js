const express = require('express')
const {
    createOrderFromCart,
    deleteOrder,
    getOrderDetail,
    getOrdersByUser,
    getAllOrders
} = require('../controllers/orderController')
const { authorizeUser, isAdminUserVendor, isAdminVendor } = require('../middlewares/auth')

const orderRouter = express.Router()

orderRouter.post('/create-order', authorizeUser, createOrderFromCart)
orderRouter.delete('/detele-order/:orderId', authorizeUser, deleteOrder)
orderRouter.get('/order-detail/:orderId', isAdminUserVendor, getOrderDetail);
orderRouter.get('/order-by-user', isAdminUserVendor, getOrdersByUser);
orderRouter.get('/all-order', isAdminVendor, getAllOrders);

module.exports = orderRouter