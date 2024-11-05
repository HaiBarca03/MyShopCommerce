const express = require('express');
const {
    createAddress,
    updateAddress,
    getAddByUser,
    getAllAddress,
    deleteAddress,
    deleteAddressesByUser
} = require('../controllers/addressController');
const { authorizeUser, isAdmin, isVendor, isAdminVendor, isAdminUser } = require('../middlewares/auth')

const addressRouter = express.Router();

addressRouter.post('/add-address', authorizeUser, createAddress);
addressRouter.put('/update-address/:id', isAdminUser, updateAddress);
addressRouter.get('/get-address-by-user', authorizeUser, getAddByUser);
addressRouter.get('/get-all-address', isAdmin, getAllAddress);
addressRouter.delete('/delete-address/:id', isAdminUser, deleteAddress);
addressRouter.delete('/delete-user-address/:id', isAdminUser, deleteAddressesByUser);

module.exports = addressRouter;