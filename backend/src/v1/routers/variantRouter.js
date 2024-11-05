const express = require('express')
const {
    createVariant,
    updateVariant,
    getAllVariant,
    getDetailVariant,
    deleteVariant
} = require('../controllers/variantController')

const { authorizeUser, isAdmin, isVendor, isAdminVendor } = require('../middlewares/auth')

const variantRouter = express.Router()

variantRouter.post('/create-variant', isAdminVendor, createVariant)
variantRouter.put('/update-variant/:variantId', isAdminVendor, updateVariant)
variantRouter.get('/get-all-variant', getAllVariant)
variantRouter.get('/get-detail-variant/:variantId', getDetailVariant)
variantRouter.delete('/delete-variant/:variantId', isVendor, deleteVariant)

module.exports = variantRouter