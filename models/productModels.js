const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories',
        require: true
    },
    productName: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    specifications: {
        type: mongoose.Schema.Types.Mixed
    },
    images: {
        type: Array,
        require: true
    }

}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('product', productSchema)