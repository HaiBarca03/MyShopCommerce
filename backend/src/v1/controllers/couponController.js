const catchAsyncError = require('../middlewares/catchAsyncError');
const CouponModel = require('../models/CouponModel')

const generateCouponCode = (type) => {
    const length = 7;
    const randomPart = Math.random().toString(36).substring(2, 2 + length);
    return type === 'shipping' ? `tsc${randomPart}` : `pdp${randomPart}`;
};

const createCoupon = catchAsyncError(async (req, res, next) => {
    try {
        const { type, discount, expiration_date, start_date, minimum_order_amount } = req.body;

        const code = generateCouponCode(type);

        const newCoupon = new CouponModel({
            code,
            type,
            discount,
            start_date,
            expiration_date,
            minimum_order_amount
        });

        await newCoupon.save();

        res.status(201).json({
            message: 'Coupon created successfully',
            coupon: newCoupon,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating coupon',
            error: error.message
        });
    }
});

const getAllCoupon = catchAsyncError(async (req, res, next) => {
    try {

        const coupon = await CouponModel.find({})
        if (!coupon || coupon.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No coupon found',
            });
        }

        res.status(201).json({
            message: 'Coupon created successfully',
            coupon: coupon,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating coupon',
            error: error.message
        });
    }
});

const getCouponsByType = catchAsyncError(async (req, res, next) => {
    try {
        const { type } = req.params;

        const coupons = await CouponModel.find({ type: { $in: [type] } });

        if (!coupons || coupons.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No coupons found for this type',
            });
        }

        res.status(200).json({
            success: true,
            coupons,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching coupons by type',
            error: error.message,
        });
    }
});

const getDetailCoupon = catchAsyncError(async (req, res, next) => {
    try {
        const { couponId } = req.params;

        const coupon = await CouponModel.findById(couponId);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Coupon get detail successfully',
            coupon: coupon,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error get detail coupon',
            error: error.message,
        });
    }
});

const updateCoupon = catchAsyncError(async (req, res, next) => {
    try {
        const { couponId } = req.params;
        const { type, discount, expiration_date, minimum_order_amount } = req.body;

        const updatedCoupon = await CouponModel.findByIdAndUpdate(
            couponId,
            { type, discount, expiration_date, minimum_order_amount },
            { new: true, runValidators: true }
        );

        if (!updatedCoupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Coupon updated successfully',
            coupon: updatedCoupon,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating coupon',
            error: error.message,
        });
    }
});

const deleteCoupon = catchAsyncError(async (req, res, next) => {
    try {
        const { couponId } = req.params;

        const coupon = await CouponModel.findByIdAndDelete(couponId)

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Coupon deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error delete coupon',
            error: error.message,
        });
    }
});

const deleteExpiredCoupons = async () => {
    try {
        const currentDate = new Date();
        const result = await CouponModel.deleteMany({ expiration_date: { $lt: currentDate } });
        console.log(`${result.deletedCount} expired coupons deleted.`);
    } catch (error) {
        console.error('Error deleting expired coupons:', error.message);
    }
};

module.exports = {
    createCoupon,
    getAllCoupon,
    getCouponsByType,
    updateCoupon,
    getDetailCoupon,
    deleteCoupon,
    deleteExpiredCoupons
}