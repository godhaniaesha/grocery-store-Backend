// const mongoose = require('mongoose')

// const categoriesSchema = mongoose.Schema({
//     categoryName: {
//         type: String,
//         required: true
//     },
//     categoryImage: {
//         type: String,
//         require: true
//     },
//     status: {
//         type: Boolean,
//         default: true
//     }
// }, {
//     timestamps: true,
//     versionKey: false
// });

// module.exports = mongoose.model('categories', categoriesSchema)

const mongoose = require('mongoose');

const categoriesSchema = mongoose.Schema({
    categoryName: {
        type: String,
        required: true
    },
    categoryImage: {
        type: String,
        required: true
    },
    vectorImage: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('categories', categoriesSchema);
