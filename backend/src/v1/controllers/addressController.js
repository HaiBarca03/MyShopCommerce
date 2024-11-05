const catchAsyncError = require('../middlewares/catchAsyncError');
const AddressModel = require('../models/AddressModel')
const UserModel = require('../models/UserModel')

const createAddress = async (req, res) => {
    try {
        const { address_label, name_address, street, city, state, postal_code, country, is_default } = req.body;

        if (!street || !city || !country) {
            return res.status(400).json({ success: false, message: 'Street, city, and country are required' });
        }

        if (is_default) {
            await AddressModel.updateMany(
                { user: req.user._id, is_default: true },
                { is_default: false }
            );
        }

        const newAddress = new AddressModel({
            user: req.user._id,
            name_address,
            address_label,
            street,
            city,
            state,
            postal_code,
            country,
            is_default
        });

        const savedAddress = await newAddress.save();

        const updatedUser = await UserModel.findByIdAndUpdate(
            req.user._id,
            { $push: { addresses: savedAddress._id } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(500).json({ success: false, message: 'Failed to update user with new address' });
        }

        return res.status(201).json({
            success: true,
            message: 'Address created successfully',
            address: savedAddress
        });
    } catch (error) {
        console.error('Error creating address:', error.message);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateAddress = async (req, res) => {
    try {
        const addressId = req.params.id;

        const address = await AddressModel.findById(addressId);
        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found',
            });
        }
        console.log('req.user.role', req.user.role)
        if (address.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to update this address',
            });
        }

        const updatedAddress = await AddressModel.findByIdAndUpdate(
            addressId,
            req.body,
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            new_address: updatedAddress,
        });
    } catch (error) {
        console.error('Error updating address:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

const getAddByUser = catchAsyncError(async (req, res, next) => {
    try {
        const userId = req.user._id.toString();

        const getAllAdd = await AddressModel.find({ user: userId });

        res.status(200).json({
            success: true,
            message: `Addresses retrieved for user`,
            addresses: getAllAdd
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving addresses',
            error: error.message
        });
    }
});

const getAllAddress = catchAsyncError(async (req, res, next) => {
    try {
        const allAddresses = await AddressModel.find({});

        if (!allAddresses || allAddresses.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No addresses found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'All addresses retrieved successfully',
            addresses: allAddresses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving addresses',
            error: error.message
        });
    }
});

const deleteAddress = catchAsyncError(async (req, res, next) => {
    try {
        const addressId = req.params.id
        const addresses = await AddressModel.findById(addressId);

        if (!addresses) {
            return res.status(404).json({
                success: false,
                message: 'No addresses found',
            });
        }

        await AddressModel.findByIdAndDelete(addressId)

        res.status(200).json({
            success: true,
            message: 'Deleted address successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error Deleted addresses',
            error: error.message
        });
    }
});

const deleteAddressesByUser = catchAsyncError(async (req, res, next) => {
    try {
        const userId = req.params.id;
        const addresses = await AddressModel.find({ user: userId });

        if (!addresses || addresses.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No addresses found for this user',
            });
        }

        await AddressModel.deleteMany({ user: userId });

        res.status(200).json({
            success: true,
            message: 'All addresses for the user have been deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting addresses for user',
            error: error.message
        });
    }
});

module.exports = {
    createAddress,
    updateAddress,
    getAddByUser,
    getAllAddress,
    deleteAddress,
    deleteAddressesByUser
}