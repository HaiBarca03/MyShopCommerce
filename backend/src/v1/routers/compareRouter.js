const express = require('express')
const {
    compareProduct,
    updateCompare,
    deleteCompare
} = require('../controllers/compareController')
const { authorizeUser, isAdmin, isVendor, isAdminVendor } = require('../middlewares/auth')

const compareRouter = express.Router()

compareRouter.post('/add-compare', authorizeUser, compareProduct)
compareRouter.put('/update-compare', authorizeUser, updateCompare)
compareRouter.delete('/delete-compare/:compareId', authorizeUser, deleteCompare)


module.exports = compareRouter