const coupen = require('../models/coupenModels')

exports.createCoupen = async (req, res) => {
    try {
        let { title, description, coupenType, coupenDiscount, startDate, endDate } = req.body

        let checkCoupenIsExist = await coupen.findOne({ title: title })

        if (checkCoupenIsExist) {
            return res.status(409).json({ status: 409, success: false, message: "Coupen Alredy Exist" })
        }

        checkCoupenIsExist = await coupen.create({
            title,
            description,
            coupenType,
            coupenDiscount,
            startDate,
            endDate
        });

        return res.status(200).json({ status: 200, success: true, message: "Coupen Create SuccessFully...", data: checkCoupenIsExist })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getAllCoupens = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, success: false, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedCoupens;

        paginatedCoupens = await coupen.find()

        let count = paginatedCoupens.length

        if (count === 0) {
            return res.status(404).json({ status: 404, success: false, message: "Coupen Not Found" })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize
            let lastIndex = (startIndex + pageSize)
            paginatedCoupens = await paginatedCoupens.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, success: true, totalCoupens: count, message: "All Coupens Found SuccessFully...", data: paginatedCoupens })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getCoupenById = async (req, res) => {
    try {
        let id = req.params.id

        let getCoupenId = await coupen.findById(id)

        if (!getCoupenId) {
            return res.status(404).json({ status: 404, success: false, message: "Coupen Not Found" })
        }

        return res.status(200).json({ status: 200, success: true, message: "Coupen Found SuccessFully...", data: getCoupenId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.updateCoupenById = async (req, res) => {
    try {
        let id = req.params.id

        let updateCoupenId = await coupen.findById(id)

        if (!updateCoupenId) {
            return res.status(404).json({ status: 404, success: false, message: "Coupen Not Found" })
        }

        updateCoupenId = await coupen.findByIdAndUpdate(id, { ...req.body }, { new: true })

        return res.status(200).json({ status: 200, success: true, message: "Coupen Updated SuccessFully...", data: updateCoupenId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.deleteCoupenById = async (req, res) => {
    try {
        let id = req.params.id

        let deleteCoupenId = await coupen.findById(id)

        if (!deleteCoupenId) {
            return res.status(404).json({ status: 404, success: false, message: "Coupen Not Found" })
        }

        await coupen.findByIdAndDelete(id)

        return res.status(200).json({ status: 200, success: true, message: "Coupen Deleted SuccessFully..." })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}