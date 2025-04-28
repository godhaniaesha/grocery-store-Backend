const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        require: true
    },
    addressId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'address',
        require: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products',
                require: true
            },
            productVarientId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'productVarients',
                require: true
            },
            quantity: {
                type: Number,
                require: true
            }
        }
    ],
    platFormFee: {
        type: Number,
        default: 0
    },
    coupenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'coupen',
        require: true
    },
    totalAmount: {
        type: Number,
        require: true
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Shipped', 'outForDelivery', 'Delivered', 'Cancelled'],
        default: 'Pending',
        require: true
    },
    paymentStatus: {
        type: String,
        enum: ['Received', 'not Received'],
        require: true
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('order', orderSchema)