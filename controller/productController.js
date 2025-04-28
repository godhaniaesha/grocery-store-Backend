const mongoose = require('mongoose')
const product = require('../models/productModels')

exports.createProduct = async (req, res) => {
    try {
        let { categoryId, productName, description, specifications, images } = req.body

        let checkProductNameIsExist = await product.findOne({ productName })

        if (checkProductNameIsExist) {
            return res.status(409).json({ status: 409, success: false, message: "ProductName already exist" })
        }

        if (!req.files) {
            return res.status(403).json({ status: 403, success: false, message: "Image Filed Is required" })
        }

        checkProductNameIsExist = await product.create({
            categoryId,
            productName,
            description,
            specifications: typeof specifications === 'string' ? JSON.parse(specifications) : specifications,
            images: req.files['images'].map(file => file.path)
        })

        return res.status(201).json({ status: 201, success: true, message: "Product Create successFully....", data: checkProductNameIsExist })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}


exports.getAllProducts = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, success: false, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedProducts = await product.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "categoryData"
                }
            },
            {
                $lookup: {
                    from: 'productvarients',
                    localField: "_id",
                    foreignField: "productId",
                    as: "productVarientData"
                }
            }
        ])

        let count = paginatedProducts.length

        if (count === 0) {
            return res.status(404).json({ status: 404, success: false, message: "Product Not Found" })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize
            let lastIndex = (startIndex + pageSize)
            paginatedProducts = await paginatedProducts.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, success: true, totalProducts: count, message: "All Products Found SuccessFully...", data: paginatedProducts })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getProductById = async (req, res) => {
    try {
        let id = req.params.id

        let getProductId = await product.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "categoryData"
                }
            },
            {
                $lookup: {
                    from: 'productvarients',
                    localField: "_id",
                    foreignField: "productId",
                    as: "productVarientData"
                }
            }
        ])

        if (!getProductId) {
            return res.status(404).json({ status: 404, success: false, message: "Product Not Found" })
        }

        return res.status(200).json({ status: 200, success: true, message: "Product Found SuccessFully...", data: getProductId })

    } catch (error) {
        console.log(error)
        return res.statsu(500).json({ status: 500, success: false, message: error.message })
    }
}
exports.updateProductById = async (req, res) => {
    try {
        const id = req.params.id;
        let updateProductId = await product.findById(id)
;

        if (!updateProductId) {
            return res.status(404).json({ status: 404, success: false, message: "Product Not Found" });
        }
        let imagesToKeep = [];
        if (req.body.existingImages) {
            try {
                imagesToKeep = JSON.parse(req.body.existingImages);
            } catch (error) {
                console.error("Error parsing existingImages:", error);
                return res.status(400).json({ status: 400, success: false, message: "Invalid image data format" });
            }
        }

        let newImages = [];
        if (req.files && req.files['images']) {
            const files = req.files['images'];
            newImages = files.map(file => file.path);
        }

        const combinedImages = [...imagesToKeep, ...newImages];

        let specifications = {};
        if (req.body.specifications) {
            try {
                specifications = typeof req.body.specifications === 'string'
                    ? JSON.parse(req.body.specifications)
                    : req.body.specifications;
            } catch (err) {
                console.log('Error parsing specifications:', err);
            }
        }

        // Build update object
        const updateData = {
            categoryId: req.body.categoryId,
            productName: req.body.productName,
            description: req.body.description,
            images: combinedImages,
            specifications: specifications
        };

        const updatedProduct = await product.findByIdAndUpdate(id, updateData, { new: true });

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Product Updated Successfully",
            data: updatedProduct
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
};


exports.deleteProductById = async (req, res) => {
    try {
        let id = req.params.id

        let deleteProductId = await product.findById(id)

        if (!deleteProductId) {
            return res.status(404).json({ status: 404, success: false, message: "Product Not Found" })
        }

        await product.findByIdAndDelete(id)

        return res.status(200).json({ status: 200, success: true, message: "Product Found SuccesssFully..." })

    } catch (error) {
        console.log(error);
        return res.statsu(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getProductByCategory = async (req, res) => {
    try {
        let id = req.params.id

        let getProduct = await product.aggregate([
            {
                $match: {
                    categoryId: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "categoryData"
                }
            },
            {
                $lookup: {
                    from: 'productvarients',
                    localField: "productId",
                    foreignField: "_id",
                    as: "productVarientData"
                }
            }
        ])

        if (!getProduct) {
            return res.status(404).json({ status: 404, success: false, message: "Product Not Found" })
        }

        return res.status(200).json({ status: 200, success: true, message: "Product Found SuccessFully...", data: getProduct })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}