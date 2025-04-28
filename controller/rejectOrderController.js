const rejectOrder = require('../models/rejectOrderModels')
const order = require('../models/orderModels')
const mongoose = require('mongoose')

exports.createRejectOrder = async (req, res) => {
    try {
        let { orderId, reasonForCancellationId, comments } = req.body

        let checkRejectOrderisExist = await rejectOrder.findOne({ orderId })

        if (checkRejectOrderisExist) {
            return res.status(409).json({ status: 409, success: false, message: "Order Is Already Rejected" })
        }

        let getOrderDetails = await order.findById(orderId)

        if (!getOrderDetails) {
            return res.status(404).json({ status: 404, success: false, message: "Order Not Found" })
        }

        checkRejectOrderisExist = await rejectOrder.create({
            orderId,
            reasonForCancellationId,
            comments
        })

        getOrderDetails.orderStatus = 'Cancelled'
        await getOrderDetails.save()

        return res.status(201).json({ status: 201, success: true, message: "Order Created SuccessFully...", data: checkRejectOrderisExist })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getAllRejectOrders = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, success: false, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedRejectOrder;

        paginatedRejectOrder = await rejectOrder.aggregate([
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
                    from: "reasons",
                    localField: "reasonForCancellationId",
                    foreignField: "_id",
                    as: "reasonData"
                }
            }
        ])

        let count = paginatedRejectOrder.length

        if (count === 0) {
            return res.status(404).json({ status: 404, success: false, message: "Reject Order Not Found" })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize
            let lastIndex = (startIndex + pageSize)
            paginatedRejectOrder = await paginatedRejectOrder.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, success: true, totalRejectOder: count, message: "All Rejectd Order Found SuccessFully...", data: paginatedRejectOrder })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getRejectOrderById = async (req, res) => {
    try {
        let id = req.params.id

        let getRejectOrderId = await rejectOrder.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
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
            }
        ])

        if (!getRejectOrderId) {
            return res.status(404).json({ status: 404, success: false, message: "Reject Order Not Found" })
        }

        return res.status(200).json({ status: 200, success: true, message: "Reject Order Found SuccessFully...", data: getRejectOrderId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}