const catchAsyncError = require('../middlewares/catchAsyncError')
const SaleModel = require('../models/SaleModel')
const ProductModel = require('../models/ProductModel')

const createSale = catchAsyncError(async (req, res, next) => {
    try {
        const { productId, quantity_sold, start_time, sale_date, sale_duration, total_price } = req.body;

        const products = await ProductModel.find({ '_id': { $in: productId } });

        if (!products) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        const end_time = new Date(new Date(start_time).getTime() + sale_duration * 60000);

        const newSale = new SaleModel({
            products: productId,
            quantity_sold,
            start_time,
            end_time,
            sale_date,
            sale_duration,
            total_price
        });

        await newSale.save();

        res.status(201).json({
            message: 'Sale created successfully',
            sale: newSale,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating sale',
            error: error.message
        });
    }
});

const getSale = catchAsyncError(async (req, res, next) => {
    try {
        const { saleId } = req.params;

        const sale = await SaleModel.findById(saleId).populate('products');

        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Sale not found',
            });
        }

        const currentTime = new Date();
        const timeLeft = Math.max(0, sale.end_time.getTime() - currentTime.getTime());
        const isSaleActive = timeLeft > 0;

        const saleStatus = isSaleActive
            ? `Sale is active. Time left: ${Math.floor(timeLeft / 1000)} seconds`
            : 'Sale has ended.';

        res.status(200).json({
            success: true,
            sale,
            sale_status: saleStatus,
            time_left: isSaleActive ? Math.floor(timeLeft / 1000) : 0,
            is_active: isSaleActive,
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error fetching sale',
            error: error.message
        });
    }
});

const updateSale = catchAsyncError(async (req, res, next) => {
    try {
        const { saleId } = req.params;
        const { productId, quantity_sold, start_time, sale_duration, total_price } = req.body;

        const sale = await SaleModel.findById(saleId);

        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Sale not found',
            });
        }

        if (productId && productId.length > 0) {
            const products = await ProductModel.find({ '_id': { $in: productId } });
            if (!products.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Some products not found',
                });
            }
            sale.products = productId;
        }

        if (quantity_sold !== undefined) {
            sale.quantity_sold = quantity_sold;
        }

        if (start_time) {
            sale.start_time = new Date(start_time);
        }

        if (sale_duration !== undefined) {
            sale.sale_duration = sale_duration;
        }

        if (start_time || sale_duration !== undefined) {
            sale.end_time = new Date(sale.start_time.getTime() + sale.sale_duration * 60000);
        }

        if (total_price !== undefined) {
            sale.total_price = total_price;
        }

        const updateSale = await SaleModel.findByIdAndUpdate(saleId, req.body, { new: true })

        res.status(200).json({
            success: true,
            message: 'Sale updated successfully',
            sale: updateSale
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating sale',
            error: error.message
        });
    }
});

const getAllSale = catchAsyncError(async (req, res, next) => {
    try {
        const allSales = await SaleModel.find({}).populate('products');

        if (!allSales || allSales.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No sales found',
            });
        }

        res.status(200).json({
            success: true,
            all_sales: allSales
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching sales',
            error: error.message
        });
    }
});

const deleteSale = catchAsyncError(async (req, res, next) => {
    try {
        const { saleId } = req.params;

        const deletedSale = await SaleModel.findByIdAndDelete(saleId);

        if (!deletedSale) {
            return res.status(404).json({
                success: false,
                message: 'Sale not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Sale deleted successfully',
            // deleted_sale: deletedSale,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting sale',
            error: error.message
        });
    }
});


module.exports = { createSale, getSale, updateSale, getAllSale, deleteSale }