const reason = require('../models/reasonforCancellationModels')

exports.createReason = async (req, res) => {
    try {
        let { reasonName } = req.body

        let existReasonName = await reason.findOne({ reasonName })

        if (existReasonName) {
            return res.status(409).json({ status: 409, success: false, message: "Reason Name already exist" })
        }

        existReasonName = await reason.create({
            reasonName
        });

        return res.status(201).json({ status: 201, success: true, message: "Reason Create SuccessFully...", data: existReasonName })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getAllReasons = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, success: false, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedReason;

        paginatedReason = await reason.find()

        let count = paginatedReason.length

        if (count === 0) {
            return res.status(404).json({ status: 404, success: false, message: "Reason Not Found" })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize
            let lastIndex = (startIndex + pageSize)
            paginatedReason = await paginatedReason.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, success: true, totalReasons: count, message: "All Reason For Cancellation Found SuccessFully...", data: paginatedReason })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getReasonById = async (req, res) => {
    try {
        let id = req.params.id

        let getReasonId = await reason.findById(id)

        if (!getReasonId) {
            return res.status(404).json({ status: 404, success: false, message: "Reason Not Found" })
        }

        return res.status(200).json({ status: 200, success: true, message: "Reason Found SuccessFully....", data: getReasonId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.updateReasonById = async (req, res) => {
    try {
        let id = req.params.id

        let updateReasonId = await reason.findById(id)

        if (!updateReasonId) {
            return res.status(404).json({ status: 404, success: false, message: "Reason Not Found" })
        }

        updateReasonId = await reason.findByIdAndUpdate(id, { ...req.body }, { new: true })

        return res.status(200).json({ status: 200, success: true, message: "Reason Update SuccessFully...", data: updateReasonId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.deleteReasonById = async (req, res) => {
    try {
        let id = req.params.id

        let deleteReasonId = await reason.findById(id)

        if (!deleteReasonId) {
            return res.status(404).json({ status: 404, success: false, message: "Reason Not Found" })
        }

        await reason.findByIdAndDelete(id)

        return res.status(200).json({ status: 200, success: true, message: "Reason Delete SuccessFully..." })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}