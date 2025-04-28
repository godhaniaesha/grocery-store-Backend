const payment = require('../models/paymentmodels')
const order = require('../models/orderModels')
const mongoose = require('mongoose')

exports.createPayment = async (req, res) => {
    try {
        let { orderId, paymentMethod } = req.body

        let checkPaymentIsExist = await payment.findOne({ orderId })

        if (checkPaymentIsExist) {
            return res.status(409).json({ status: 409, success: false, message: "Payment is already exist" })
        }

        let getOrderId = await order.findById(orderId)

        if (!getOrderId) {
            return res.status(404).json({ status: 404, success: false, message: "Order not found" })
        }

        checkPaymentIsExist = await payment.create({
            orderId,
            paymentMethod
        });

        getOrderId.paymentStatus = 'Received'

        await getOrderId.save()

        return res.status(201).json({ status: 201, success: true, message: "Payment Created SuccessFully...", data: checkPaymentIsExist })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getAllPayments = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, success: false, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedPayments;

        paginatedPayments = await payment.aggregate([
            {
                $lookup: {
                    from: 'orders',
                    localField: "orderId",
                    foreignField: "_id",
                    as: "orderData"
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'orderData.userId',
                    foreignField: '_id',
                    as: 'userData'
                }
            }
        ])

        let count = paginatedPayments.length

        if (count === 0) {
            return res.status(404).json({ status: 404, success: false, message: "Payment Not Found" })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize
            let lastIndex = (startIndex + pageSize)
            paginatedPayments = await paginatedPayments.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, success: true, totalPayments: count, message: "Get All Payments Found SuccessFully...", data: paginatedPayments })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getPaymentById = async (req, res) => {
    try {
        let id = req.params.id

        let getPaymentId = await payment.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: "orders",
                    localField: "orderId",
                    foreignField: "_id",
                    as: "orderData"
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'orderData.userId',
                    foreignField: '_id',
                    as: 'userData'
                }
            }
        ])

        if (!getPaymentId) {
            return res.status(404).json({ status: 404, success: false, message: "Payment Not Found" })
        }

        return res.status(200).json({ status: 200, success: true, message: "Payment Found SuccessFully...", data: getPaymentId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}