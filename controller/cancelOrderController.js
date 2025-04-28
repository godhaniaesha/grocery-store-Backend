const mongoose = require('mongoose')
const cancelOrder = require('../models/cancelOrder')
const order = require('../models/orderModels')

exports.createCancelOrder = async (req, res) => {
    try {
        let { orderId, reasonForCancellationId, comments } = req.body

        let checkCancelOrderIsExist = await cancelOrder.findOne({ orderId })

        if (checkCancelOrderIsExist) {
            return res.status(409).json({ status: 409, success: false, message: "Order Is Already Cancelled" })
        }

        let getOrderData = await order.findById(orderId)

        if (!getOrderData) {
            return res.status(404).json({ status: 404, success: false, message: "Order Not Found" })
        }

        checkCancelOrderIsExist = await cancelOrder.create({
            orderId,
            reasonForCancellationId,
            comments
        });

        getOrderData.orderStatus = 'Cancelled'

        await getOrderData.save();

        return res.status(201).json({ status: 201, success: true, message: "Order Cancelled SuccessFully...", data: checkCancelOrderIsExist })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getAllCancelOrder = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, success: false, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedCancelOrder;

        paginatedCancelOrder = await cancelOrder.aggregate([
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
                    from: 'reasons',
                    localField: "reasonForCancellationId",
                    foreignField: "_id",
                    as: "reasonData"
                }
            },
        ])

        let count = paginatedCancelOrder.length

        if (count === 0) {
            return res.status(404).json({ status: 404, success: false, message: "Cancel Order Not Found" })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize
            let lastIndex = (startIndex + pageSize)
            paginatedCancelOrder = await paginatedCancelOrder.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, success: true, totalCancelOrders: count, message: "All Cancel Order Found SuccessFully...", data: paginatedCancelOrder })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getCancelOrderById = async (req, res) => {
    try {
        let id = req.params.id

        let getCancelOrderId = await cancelOrder.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'orderId',
                    foreignField: '_id',
                    as: 'orderData'
                }
            },
            {
                $lookup: {
                    from: "reasons",
                    localField: "reasonForCancellationId",
                    foreignField: "_id",
                    as: "reasonData"
                }
            }
        ])

        if (!getCancelOrderId) {
            return res.status(404).json({ status: 404, success: false, message: "Cancel Order Not Found" })
        }

        return res.status(200).json({ status: 200, success: true, message: "Cancel Order Found SuccessFully...", data: getCancelOrderId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}