const mongoose = require('mongoose')

const cancelOrderSchema = mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orders',
        require: true
    },
    reasonForCancellationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'reasonForCancellation',
        require: true
    },
    comments: {
        type: String,
        require: true
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('cancelOrder', cancelOrderSchema);