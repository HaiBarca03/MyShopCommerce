const express = require('express')
const {
    createCoupon,
    getAllCoupon,
    getCouponsByType,
    updateCoupon,
    getDetailCoupon,
    deleteCoupon
} = require('../controllers/couponController')
const { authorizeUser, isAdmin, isVendor, isAdminVendor } = require('../middlewares/auth')

const couponRouter = express.Router()

couponRouter.post('/create-coupon', createCoupon)
couponRouter.get('/get-all-coupon', getAllCoupon)
couponRouter.get('/get-type-coupon/:type', getCouponsByType)
couponRouter.get('/get-detail-coupon/:couponId', getDetailCoupon)
couponRouter.put('/update-coupon/:couponId', updateCoupon)
couponRouter.delete('/delete-coupon/:couponId', deleteCoupon)


module.exports = couponRouter