const order = require('../models/orderModels')
const cart = require('../models/cartModels')
const Coupon = require('../models/coupenModels')
const ProductVariant = require('../models/productVarientModels')
const stock = require('../models/stockModels')

const mongoose = require('mongoose')

exports.createOrder = async (req, res) => {
    try {
        let { items, addressId, coupenId, platFormFee = 10 } = req.body

        items = await cart.find({ userId: req.user._id })

        if (!items) {
            return res.status(404).json({ status: 404, success: false, message: "Cart Item Not Found" })
        }

        let coupon;
        if (coupenId) {
            coupon = await Coupon.findById(coupenId);
            if (!coupon) {
                return res.status(404).json({ status: 404, success: false, message: 'Coupon Not Found' });
            }
        }

        let totalAmount = 0;
        for (const item of items) {
            const product = await ProductVariant.findById(item.productVarientId);
            totalAmount += product.price * item.quantity
        }

        if (coupon) {
            if (coupon.coupenType === 'Fixed') {
                totalAmount -= coupon.coupenDiscount;

            } else if (coupon.coupenType === 'Percentage') {
                totalAmount -= (totalAmount * parseFloat(coupon.coupenDiscount) / 100);
            }
        }

        totalAmount += platFormFee

        const orderCreate = await order.create({
            userId: req.user._id,
            addressId,
            items,
            platFormFee,
            coupenId,
            totalAmount
        });

        await cart.deleteMany({ userId: req.user._id });

        for (let item of items) {
            let stockData = await stock.findOne({ productId: item.productId })
            stockData.quantity -= item.quantity;
            await stockData.save();
        }

        return res.status(201).json({ status: 201, success: true, message: "Order Create SuccessFully....", data: orderCreate })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getAllOrders = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, success: false, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedOrders;

        paginatedOrders = await order.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: "items.productId",
                    foreignField: '_id',
                    as: "productData"
                }
            },
            {
                $lookup: {
                    from: 'productvarients',
                    localField: "items.productVarientId",
                    foreignField: "_id",
                    as: "productVarientData"
                }
            },
            {
                $lookup: {
                    from: 'coupens',
                    localField: 'coupenId',
                    foreignField: "_id",
                    as: "coupenData"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userData"
                }
            },
            {
                $lookup: {
                    from: 'addresses',
                    localField: "addressId",
                    foreignField: "_id",
                    as: "addressData"
                }
            },
            {
                $lookup: {
                    from: 'rejectorder',
                    localField: "_id",
                    foreignField: "orderId",
                    as: "rejectData"
                }
            },
            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'orderId',
                    as: 'paymentData'
                }
            }
        ])

        let count = paginatedOrders.length

        if (count === 0) {
            return res.status(404).json({ status: 404, success: false, message: "Order Not Found" })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize
            let lastIndex = (startIndex + pageSize)
            paginatedOrders = await paginatedOrders.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, success: true, totalOrders: count, message: "All Orders Found SuccessFully...", data: paginatedOrders })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getOrderById = async (req, res) => {
    try {
        let id = req.params.id

        let getOrderId = await order.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: "items.productId",
                    foreignField: '_id',
                    as: "productData"
                }
            },
            {
                $lookup: {
                    from: 'productvarients',
                    localField: "items.productVarientId",
                    foreignField: "_id",
                    as: "productVarientData"
                }
            },
            {
                $lookup: {
                    from: 'coupens',
                    localField: 'coupenId',
                    foreignField: "_id",
                    as: "coupenData"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userData"
                }
            },
            {
                $lookup: {
                    from: 'addresses',
                    localField: "addressId",
                    foreignField: "_id",
                    as: "addressData"
                }
            },
            {
                $lookup: {
                    from: 'rejectorders',
                    localField: "_id",
                    foreignField: "orderId",
                    as: "rejectData"
                }
            },
            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'orderId',
                    as: 'paymentData'
                }
            }
        ])

        if (!getOrderId) {
            return res.status(404).json({ status: 404, success: false, message: "Order Not Found" })
        }

        return res.status(200).json({ status: 200, success: true, message: "Order Found SuccessFully...", data: getOrderId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.updateOrderStatusById = async (req, res) => {
    try {
        let id = req.params.id

        let updateOrderId = await order.findById(id)

        if (!updateOrderId) {
            return res.statsu(404).json({ status: 404, success: false, message: "Order Not Found" })
        }

        updateOrderId = await order.findByIdAndUpdate(id, { ...req.body }, { new: true })

        return res.status(200).json({ status: 200, success: true, message: "Order Status Updated SuccessFully...", data: updateOrderId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.deleteOrderById = async (req, res) => {
    try {
        let id = req.params.id

        let deleteOrderId = await order.findById(id)

        if (!deleteOrderId) {
            return res.status(404).json({ status: 404, success: false, message: "Order Not Found" })
        }

        await order.findByIdAndDelete(id)

        return res.status(200).json({ status: 200, success: true, message: "Order Delete SuccessFully..." })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getAllMyOrders = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, success: false, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedMyOrders;

        paginatedMyOrders = await order.aggregate([
            {
                $match: {
                    userId: req.user._id
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: "items.productId",
                    foreignField: '_id',
                    as: "productData"
                }
            },
            {
                $lookup: {
                    from: 'productvarients',
                    localField: "items.productVarientId",
                    foreignField: "_id",
                    as: "productVarientData"
                }
            },
            {
                $lookup: {
                    from: 'coupens',
                    localField: 'coupenId',
                    foreignField: "_id",
                    as: "coupenData"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userData"
                }
            },
            {
                $lookup: {
                    from: 'addresses',
                    localField: "addressId",
                    foreignField: "_id",
                    as: "addressData"
                }
            },
            {
                $lookup: {
                    from: 'rejectorder',
                    localField: "_id",
                    foreignField: "orderId",
                    as: "rejectData"
                }
            },
            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'orderId',
                    as: 'paymentData'
                }
            }
        ])

        let count = paginatedMyOrders.length

        if (count === 0) {
            return res.status(404).json({ status: 404, success: false, message: 'Order Not Found' })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize
            let lastIndex = (startIndex + pageSize)
            paginatedMyOrders = await paginatedMyOrders.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, success: true, totalMyOrders: count, message: "All Orders Found SuccessFully...", data: paginatedMyOrders })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}