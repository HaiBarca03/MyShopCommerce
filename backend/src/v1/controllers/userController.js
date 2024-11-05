const UserModel = require('../models/UserModel')
const AddressModel = require('../models/AddressModel')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const crypto = require('crypto');
const { genneralAccessToken, genneralRefreshToken } = require('../utils/jwtService')
const { sendEmail } = require('../utils/sendEmail')

const registerUser = async (req, res) => {
    const { name, email, password, confirmPassword } = req.body

    try {
        const exists = await UserModel.findOne({ email })
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: 'Please enter a valid email' })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: 'Please enter a strong password' })
        }

        if (password !== confirmPassword) {
            return res.json({ success: false, message: 'Password is not the same' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const newUser = new UserModel({
            name: name,
            email: email,
            password: hashedPassword,
        })

        const user = await newUser.save()

        res.json({
            success: true,
            data: newUser,
            message: 'create acc success'
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: 'Error' })
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await UserModel.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: 'User does not exists' })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid information' })
        }

        const refresh_token = await genneralRefreshToken({
            id: user.id,
            isAdmin: user.isAdmin
        })

        const access_token = await genneralAccessToken({
            id: user.id,
            isAdmin: user.isAdmin
        })

        console.log('access_token', access_token)
        const response = {
            success: true,
            access_token: access_token,
            refresh_token: refresh_token,
            user: user
        };

        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: false,
            samesite: 'strict'
        });
        console.log('refresh_token', refresh_token)
        res.json(response);

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: 'Error' })
    }
}

const updateUser = async (req, res) => {
    const userId = req.params.id;
    const data = req.body;

    try {
        const checkUser = await UserModel.findById(userId);
        if (!checkUser) {
            return res.json({ success: false, message: 'User does not exist' });
        }
        const updatedUser = await UserModel.findByIdAndUpdate(userId, data, { new: true });

        if (!updatedUser) {
            return res.json({ success: false, message: 'Failed to update user' });
        }
        console.log('data:', data)
        res.json({
            success: true,
            data: updatedUser
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Error updating user' });
    }
}

const refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refresh_token;

    try {
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: 'Refresh token missing. Authorization denied.' });
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN, async (err, user) => {
            if (err) {
                return res.status(403).json({ success: false, message: 'Invalid refresh token.' });
            }

            const newAccessToken = await genneralAccessToken({ id: user.id, isAdmin: user.isAdmin });
            res.json({
                success: true,
                message: 'New access token generated successfully',
                access_token: newAccessToken
            });
        });
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({ success: false, message: 'Server error refreshing token' });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Email không tồn tại' });
        }

        const newPassword = Math.random().toString(36).slice(-8);

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)
        user.password = hashedPassword;
        await user.save();

        await sendEmail(email, newPassword);

        return res.status(200).json({ message: 'Mật khẩu mới đã được gửi đến email của bạn' });
    } catch (error) {
        return res.status(500).json({ message: 'Đã xảy ra lỗi', error });
    }
};

const updatePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const userId = req.user

    try {
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedNewPassword;
        await user.save();

        return res.status(200).json({ message: 'Mật khẩu đã được cập nhật thành công' });
    } catch (error) {
        return res.status(500).json({ message: 'Đã xảy ra lỗi', error });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.find().select('-password');
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: 'Đã xảy ra lỗi', error });
    }
};

const getDetailUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await UserModel.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Đã xảy ra lỗi', error });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const userId = req.params.id

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Người dùng đã là admin' });
        }

        user.role = 'admin';
        await user.save();

        return res.status(200).json({ message: 'Cập nhật vai trò thành công', user });
    } catch (error) {
        return res.status(500).json({ message: 'Đã xảy ra lỗi', error });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        await AddressModel.deleteMany({ user: userId });
        await UserModel.findByIdAndDelete(userId);

        return res.status(200).json({ message: 'Xóa người dùng thành công' });
    } catch (error) {
        return res.status(500).json({ message: 'Đã xảy ra lỗi', error });
    }
};

module.exports = {
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
}