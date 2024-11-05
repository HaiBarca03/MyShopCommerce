const express = require('express')
const {
    registerUser,
    loginUser,
    refreshToken,
    updateUser,
    forgotPassword,
    updatePassword,
    getAllUsers,
    getDetailUser,
    updateUserRole,
    deleteUser
} = require('../controllers/userController')

const { authorizeUser, isAdmin } = require('../middlewares/auth')

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/get-detail-user/:id', authorizeUser, getDetailUser)
userRouter.put('/update-user/:id', authorizeUser, updateUser)
userRouter.put('/updatePassword', authorizeUser, updatePassword)
userRouter.post('/refresh-token', refreshToken)
userRouter.put('/forgotPassword', forgotPassword)
userRouter.get('/admin/get-all-users', isAdmin, getAllUsers)
userRouter.put('/admin/update-role-user/:id', isAdmin, updateUserRole)
userRouter.delete('/admin/delete-user/:id', isAdmin, deleteUser)

module.exports = userRouter