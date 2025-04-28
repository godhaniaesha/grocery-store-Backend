const address = require('../models/addresModels')
const mongoose = require('mongoose')

exports.createAddress = async (req, res) => {
    try {
        let { firstName, lastName, phone, email, address1, address2, postalCode, city, state, country, saveAddressAs } = req.body

        let newAddressCreate = await address.create({
            firstName,
            lastName,
            phone,
            email,
            address1,
            address2,
            postalCode,
            city,
            state,
            country,
            saveAddressAs,
            userId: req.user._id
        });

        return res.status(201).json({ status: 201, success: true, message: "Address Create SuccessFully...", data: newAddressCreate })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getAllAddress = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, success: false, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedAddress;

        paginatedAddress = await address.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: "userId",
                    foreignField: "_id",
                    as: "userData"
                }
            }
        ])

        let count = paginatedAddress.length

        if (count === 0) {
            return res.status(404).json({ status: 404, success: false, message: "No Address Found" })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize
            let lastIndex = (startIndex + pageSize)
            paginatedAddress = await paginatedAddress.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, success: true, totalAddress: count, message: "All Address Found SuccessFully...", data: paginatedAddress })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getAddressById = async (req, res) => {
    try {
        let id = req.params.id

        let getAddressId = await address.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userData"
                }
            }
        ])

        if (!getAddressId) {
            return res.status(404).json({ status: 404, success: false, message: "Address Not Found" })
        }

        return res.status(200).json({ status: 200, success: true, message: "Address Found SuccessFully...", data: getAddressId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.updateAddressById = async (req, res) => {
    try {
        let id = req.params.id

        let updateAddressId = await address.findById(id)

        if (!updateAddressId) {
            return res.status(404).json({ status: 404, success: false, message: "Address Not Found" })
        }

        updateAddressId = await address.findByIdAndUpdate(id, { ...req.body }, { new: true })

        return res.status(200).json({ status: 200, success: true, message: "Address Updated SuccessFully...", data: updateAddressId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.deleteAddressById = async (req, res) => {
    try {
        let id = req.params.id

        let deleteAddressId = await address.findById(id)

        if (!deleteAddressId) {
            return res.status(404).json({ status: 404, success: false, message: "Address Not Found" })
        }

        await address.findByIdAndDelete(id)

        return res.status(200).json({ status: 200, success: true, message: "Address Delete SuccessFully...." })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getAllMyAddress = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, success: false, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedAddress;

        paginatedAddress = await address.aggregate([
            {
                $match: {
                    userId: req.user._id
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: "userId",
                    foreignField: "_id",
                    as: "userData"
                }
            }
        ])

        let count = paginatedAddress.length

        if (count === 0) {
            return res.status(404).json({ status: 404, success: false, message: "Address Not Found" })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize
            let lastIndex = (startIndex + pageSize)
            paginatedAddress = await paginatedAddress.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, success: true, totalAddress: count, message: "Address Found SuccessFully...", data: paginatedAddress })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}