const express = require('express')
const { createCategory,
    updateCategory,
    getAllCategory,
    deleteCategory } = require('../controllers/categoryController')
const { authorizeUser, isAdmin, isVendor, isAdminVendor } = require('../middlewares/auth')

const categoryRouter = express.Router()

categoryRouter.post('/create-category', isAdmin, createCategory)
categoryRouter.put('/update-category/:categoryId', isAdmin, updateCategory)
categoryRouter.get('/get-all-category', getAllCategory)
categoryRouter.delete('/delete-category/:categoryId', isAdmin, deleteCategory)

module.exports = categoryRouter