const express = require('express')
const { createPaymentOnDelivery, createPaymentMomo, checkStatus, callback } = require('../controllers/paymentController')
const { authorizeUser } = require('../middlewares/auth')

const paymentRouter = express.Router()

paymentRouter.post('/create-payment-delivery/:orderId', authorizeUser, createPaymentOnDelivery)
paymentRouter.post('/payment-momo/:orderId', authorizeUser, createPaymentMomo)
paymentRouter.post('/callback', callback)
paymentRouter.post('/check-status-transaction', checkStatus)

module.exports = paymentRouter