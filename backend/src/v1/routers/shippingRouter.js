const express = require('express')
const { createShipping, updateShipping, getAllShipping, deleteShipping, getShippingDetail } = require('../controllers/shippingController')
const { authorizeUser, isAdmin, isVendor, isAdminVendor, isAdminUserVendor } = require('../middlewares/auth')

const shippingRouter = express.Router()

shippingRouter.post('/add-shipping', createShipping)
shippingRouter.put('/update-shipping/:shippingId', updateShipping)
shippingRouter.get('/get-all-ship', isAdminVendor, getAllShipping)
shippingRouter.delete('/delete-ship/:shippingId', isAdminVendor, deleteShipping)
shippingRouter.get('/detail-ship/:shippingId', isAdminUserVendor, getShippingDetail)

module.exports = shippingRouter