const wishlist = require('../models/wishlistModels')
const mongoose = require('mongoose')

exports.createWishlist = async (req, res) => {
    try {
        let { productId } = req.body

        let checkExistWishlistProduct = await wishlist.findOne({ userId: req.user._id, productId })

        if (checkExistWishlistProduct) {
            return res.status(409).json({ status: 409, success: false, message: "Product Already In Wishlist" })
        }

        checkExistWishlistProduct = await wishlist.create({
            userId: req.user._id,
            productId
        });

        return res.status(201).json({ status: 201, success: true, message: "Product Added To Wishlist Successfully", data: checkExistWishlistProduct })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getAllMyWishlist = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, success: false, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedWishlist = await wishlist.aggregate([
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
            }
        ])

        let count = paginatedWishlist.length

        if (count === 0) {
            return res.status(404).json({ status: 404, success: false, message: "Wishlist Is Empty" })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize
            let lastIndex = (startIndex + pageSize)
            paginatedWishlist = await paginatedWishlist.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, success: true, totalItems: count, message: "Wishlist Items Found Successfully", data: paginatedWishlist })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.deleteWishlistItem = async (req, res) => {
    try {
        let id = req.params.id

        let deleteWishlistItem = await wishlist.findById(id)

        if (!deleteWishlistItem) {
            return res.status(404).json({ status: 404, success: false, message: "Item Not Found In Wishlist" })
        }

        await wishlist.findByIdAndDelete(id)

        return res.status(200).json({ status: 200, success: true, message: "Item Removed From Wishlist Successfully" })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}