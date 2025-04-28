const mongoose = require('mongoose')

const subCategorySchema = mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories',
        required: true
    },
    subCategoryName: {
        type: String,
        required: true
    },
    subCategoryImage: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        require: true,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
})

module.exports = mongoose.model('subCategory', subCategorySchema);