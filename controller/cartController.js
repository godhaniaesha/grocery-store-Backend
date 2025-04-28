const cart = require('../models/cartModels')
const mongoose = require('mongoose')

exports.createCart = async (req, res) => {
    try {
        let { productId, productVarientId, quantity } = req.body

        let checkExistCartProduct = await cart.findOne({ userId: req.user._id, productId, productVarientId })

        if (checkExistCartProduct) {
            checkExistCartProduct.quantity += quantity
            await checkExistCartProduct.save()

            return res.status(409).json({ status: 409, success: false, message: "Cart Already Exist" })
        }

        checkExistCartProduct = await cart.create({
            userId: req.user._id,
            productId,
            productVarientId,
            quantity
        });

        return res.status(201).json({ status: 201, success: true, message: "Cart Created SuccessFully...", data: checkExistCartProduct })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getAllCarts = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, success: false, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedCarts;

        paginatedCarts = await cart.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: "productId",
                    foreignField: "_id",
                    as: "productData"
                }
            },
            {
                $lookup: {
                    from: 'productvarients',
                    localField: "productVarientId",
                    foreignField: "_id",
                    as: "productVarientData"
                }
            }
        ])

        let count = paginatedCarts.length

        if (count === 0) {
            return res.status(404).json({ status: 404, success: false, message: "Cart Not Found" })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize
            let lastIndex = (startIndex + pageSize)
            paginatedCarts = await paginatedCarts.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, success: true, totalCarts: count, message: 'All Carts Found SuccessFully...', data: paginatedCarts })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getCartsById = async (req, res) => {
    try {
        let id = req.params.id

        let getCartId = await cart.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: "productId",
                    foreignField: "_id",
                    as: "productData"
                }
            },
            {
                $lookup: {
                    from: 'productvarients',
                    localField: "productVarientId",
                    foreignField: "_id",
                    as: "productVarientData"
                }
            }
        ])

        if (!getCartId) {
            return res.status(404).json({ status: 404, success: false, message: "Cart Not Found" })
        }

        return res.status(200).json({ status: 200, success: true, message: "Cart Found SuccessFully...", data: getCartId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.updateCartsById = async (req, res) => {
    try {
        let id = req.params.id

        let updateCartId = await cart.findById(id)

        if (!updateCartId) {
            return res.status(404).json({ status: 404, success: false, message: "Cart Not Found" })
        }

        updateCartId = await cart.findByIdAndUpdate(id, { ...req.body }, { new: true })

        return res.status(200).json({ status: 200, success: true, message: "Cart Update SuccessFully...", data: updateCartId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.deleteCartById = async (req, res) => {
    try {
        let id = req.params.id

        let deleteCartId = await cart.findById(id)

        if (!deleteCartId) {
            return res.status(404).json({ status: 404, success: false, message: "Cart Not Found" })
        }

        await cart.findByIdAndDelete(id)

        return res.status(200).json({ status: 200, success: true, message: "Cart Delete SuccessFully...." })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getAllMyCarts = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, success: false, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedMyCarts;

        paginatedMyCarts = await cart.aggregate([
            {
                $match: {
                    userId: req.user._id
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: "productId",
                    foreignField: "_id",
                    as: "productData"
                }
            },
            {
                $lookup: {
                    from: 'productvarients',
                    localField: "productVarientId",
                    foreignField: "_id",
                    as: "productVarientData"
                }
            }
        ])

        let count = paginatedMyCarts.length

        if (count === 0) {
            return res.status(404).json({ status: 404, success: false, message: "Cart Not Found" })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize
            let lastIndex = (startIndex + pageSize)
            paginatedMyCarts = await paginatedMyCarts.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, success: true, totalMyCart: count, message: "All My Carts Found SuccessFully...", data: paginatedMyCarts })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}
