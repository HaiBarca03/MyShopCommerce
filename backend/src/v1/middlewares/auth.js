const UserModel = require('../models/UserModel');
const jwt = require('jsonwebtoken')
require('dotenv').config()

const authorizeUser = async (req, res, next) => {
    try {
        // Extract token from Authorization header (Bearer <token>)
        const authHeader = req.headers.token;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: 'Access token missing. Authorization denied.' });
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);

        const user = await UserModel.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        req.user = user;
        // console.log('req.user', req.user)
        next();
    } catch (error) {
        console.error('Authorization error:', error.message);
        return res.status(401).json({ success: false, message: 'Invalid access token. Authorization denied.' });
    }
};

const isVendor = async (req, res, next) => {
    try {
        const authHeader = req.headers.token;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: 'Access token missing. Authorization denied.' });
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);

        const vendor = await UserModel.findById(decoded.id);

        if (!vendor) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        if (vendor.role !== 'vendor') {
            return res.status(403).json({ message: 'Chỉ vendor mới có quyền truy cập' });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: 'Đã xảy ra lỗi', error });
    }
};

const isAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.token;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: 'Access token missing. Authorization denied.' });
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);

        const admin = await UserModel.findById(decoded.id);

        if (!admin) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        if (admin.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: 'Đã xảy ra lỗi', error });
    }
};

const isAdminVendor = async (req, res, next) => {
    try {
        const authHeader = req.headers.token;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: 'Access token missing. Authorization denied.' });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);

        const user = await UserModel.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        req.user = user;

        if (req.user.role === 'admin' || req.user.role === 'vendor') {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Only admin or vendor can access this resource'
        });

    } catch (error) {
        console.error('Authorization error:', error.message);
        return res.status(500).json({ message: 'Đã xảy ra lỗi', error });
    }
};

const isAdminUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.token;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: 'Access token missing. Authorization denied.' });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);

        const user = await UserModel.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        req.user = user
        console.log('req.user.role', req.user.role)

        if (req.user.role === 'admin' || req.user._id.toString() === decoded.id) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Only admin or user can access this resource'
        });
    } catch (error) {
        console.error('Authorization error:', error.message);
        return res.status(500).json({ message: 'An error occurred', error });
    }
};

const isAdminUserVendor = async (req, res, next) => {
    try {
        const authHeader = req.headers.token;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: 'Access token missing. Authorization denied.' });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);

        const user = await UserModel.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        req.user = user;
        console.log('req.user.role', req.user.role);

        if (req.user.role === 'admin' || req.user.role === 'vendor' || req.user._id.toString() === decoded.id) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Only admin, vendor, or the logged-in user can access this resource'
        });
    } catch (error) {
        console.error('Authorization error:', error.message);
        return res.status(500).json({ message: 'An error occurred', error });
    }
};

module.exports = { authorizeUser, isAdmin, isVendor, isAdminVendor, isAdminUser, isAdminUserVendor }