const mongoose = require('mongoose')
const product = require('../models/productModels')

exports.createProduct = async (req, res) => {
    try {
        const { categoryId, productName, description, subCategoryId, tags } = req.body;

        // Check if product name already exists
        const checkProductNameIsExist = await product.findOne({ productName });
        if (checkProductNameIsExist) {
            return res.status(409).json({ status: 409, success: false, message: "ProductName already exist" });
        }

        // Check for images in req.files
        if (!req.files || !req.files['images'] || req.files['images'].length === 0) {
            return res.status(403).json({ status: 403, success: false, message: "Image Field Is required" });
        }

        // Create the product
        const newProduct = await product.create({
            categoryId,
            productName,
            description,
            images: req.files['images'].map(file => file.path),
            subCategoryId,
            tags
        });

        // Log the created product
        console.log("Product created successfully:", newProduct);

        return res.status(201).json({ status: 201, success: true, message: "Product Create successFully....", data: newProduct });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
};

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
                    from: 'subCategory',
                    localField: "subCategoryId",
                    foreignField: "_id",
                    as: "subcategoryData"
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

        let count = paginatedProducts.length; // <-- Make sure this is here

        if (count === 0) {
            return res.status(404).json({ status: 404, success: false, message: "Product Not Found" });
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize;
            let lastIndex = (startIndex + pageSize);
            paginatedProducts = await paginatedProducts.slice(startIndex, lastIndex);
        }

        return res.status(200).json({ status: 200, success: true, totalProducts: count, message: "All Products Found SuccessFully...", data: paginatedProducts });

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
                $unwind: {
                    path: "$productData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'subCategory', // or 'subcategories' if that's your collection name
                    localField: "productData.subCategoryId",
                    foreignField: "_id",
                    as: "productData.subcategoryData"
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
        return res.status(500).json({ status: 500, success: false, message: error.message })
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


        // Build update object
        const updateData = {
            categoryId: req.body.categoryId,
            subCategoryId: req.body.subCategoryId,
            productName: req.body.productName,
            description: req.body.description,
            images: combinedImages,

            tags: req.body.tags
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
                    from: 'subCategory',
                    localField: "subCategoryId",
                    foreignField: "_id",
                    as: "subcategoryData"
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