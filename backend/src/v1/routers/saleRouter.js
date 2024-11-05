const express = require('express')
const {
    createSale,
    getSale,
    updateSale,
    getAllSale,
    deleteSale
} = require('../controllers/saleController')

const { authorizeUser, isAdmin, isVendor, isAdminVendor } = require('../middlewares/auth')

const saleRouter = express.Router()

saleRouter.post('/create-sale', isAdminVendor, createSale)
saleRouter.get('/get-detail-sale/:saleId', getSale)
saleRouter.put('/update-sale/:saleId', isAdminVendor, updateSale)
saleRouter.get('/get-all-sale', getAllSale)
saleRouter.delete('/delete-sale/:saleId', isAdminVendor, deleteSale)

module.exports = saleRouter