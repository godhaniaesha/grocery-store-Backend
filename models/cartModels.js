const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        require: true
    },
    productVarientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'productVarient',
    },
    quantity: {
        type: Number,
        require: true
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('cart', cartSchema);