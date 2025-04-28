const productVarient = require('../models/productVarientModels')
const mongoose = require('mongoose')

exports.createProductVarient = async (req, res) => {
    try {
        let { productId, size, price, discount, sellerId, stockStatus } = req.body

        let discountAmount = parseFloat(discount) / 100
        let amount = price * discountAmount
        let discountPrice = price + amount


        let productVarientCreate = await productVarient.create({
            productId,
            size,
            price,
            discountPrice,
            discount,
            sellerId,
            stockStatus
        });

        return res.status(201).json({ status: 201, success: true, message: "Product Varient Create SuccessFully...", data: productVarientCreate })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getAllProductVarient = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, success: false, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedProductVarient;

        paginatedProductVarient = await productVarient.aggregate([
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
                    from: 'categories',
                    localField: "productData.categoryId",
                    foreignField: "_id",
                    as: "categoryData"
                }
            },
        ])
        let count = productVarient.length

        if (count === 0) {
            return res.status(404).json({ status: 404, success: false, message: "Product Varient Not Found" })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize
            let lastIndex = (startIndex + pageSize)
            paginatedProductVarient = await paginatedProductVarient.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, success: true, totalProductVarient: count, message: "All Product Varient Foudn SuccessFully...", data: paginatedProductVarient })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getProductVarientById = async (req, res) => {
    try {
        let id = req.params.id

        let getProductVarientId = await productVarient.aggregate([
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
                    from: 'categories',
                    localField: "productData.categoryId",
                    foreignField: "_id",
                    as: "categoryData"
                }
            },
        ])
        if (!getProductVarientId) {
            return res.status(404).json({ status: 404, success: false, message: "Product Varient Not Found" })
        }

        return res.status(200).json({ status: 200, success: true, message: "Product Varient Found SuccessFully...", data: getProductVarientId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.updateProductVarientById = async (req, res) => {
    try {
        let id = req.params.id

        let updateProductVarientId = await productVarient.findById(id)

        if (!updateProductVarientId) {
            return res.status(404).json({ status: 404, success: false, message: "Product Varient Not Found" })
        }

        let oldPrice = updateProductVarientId.price;
        let oldDiscount = updateProductVarientId.discount;

        if (req.body.price && !req.body.discount) {
            let discountAmount = parseFloat(oldDiscount) / 100;
            let amount = req.body.price * discountAmount;
            let discountPrice = req.body.price + amount;
            req.body.discountPrice = discountPrice;
        }

        if (!req.body.price && req.body.discount) {
            let discountAmount = parseFloat(req.body.discount) / 100;
            let amount = oldPrice * discountAmount;
            let discountPrice = oldPrice + amount;
            req.body.discountPrice = discountPrice;
        }

        if (req.body.price && req.body.discount) {
            let discountAmount = parseFloat(req.body.discount) / 100;
            let amount = req.body.price * discountAmount;
            let discountPrice = req.body.price + amount;
            req.body.discountPrice = discountPrice;
        }

        updateProductVarientId = await productVarient.findByIdAndUpdate(id, { ...req.body }, { new: true })

        return res.status(200).json({ status: 200, success: true, message: 'Product Varient Update SuccessFully...', data: updateProductVarientId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.deleteProductVarientById = async (req, res) => {
    try {
        let id = req.params.id

        let deleteProductVarientId = await productVarient.findById(id)

        if (!deleteProductVarientId) {
            return res.status(404).json({ status: 404, success: false, message: "Product Varient Not Found" })
        }

        await productVarient.findByIdAndDelete(id)

        return res.status(200).json({ status: 200, success: true, message: "Product Varient Delete SuccessFully..." })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getOwnProductVar = async (req, res) => {
    try {
        const sellerId = req.user._id; // Get logged in seller ID from auth

        const ownProducts = await productVarient.aggregate([
            {
                $match: {
                    sellerId: new mongoose.Types.ObjectId(sellerId)
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $unwind: "$productDetails"
            },
            {
                $group: {
                    _id: "$sellerId",
                    products: {
                        $addToSet: {
                            productId: "$productId",
                            productName: "$productDetails.productName",
                            categoryId: "$productDetails.categoryId"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    sellerId: "$_id",
                    products: 1
                }
            }
        ]);

        if (!ownProducts || ownProducts.length === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "No products found"
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Own products retrieved successfully",
            data: ownProducts
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: error.message
        });
    }
}