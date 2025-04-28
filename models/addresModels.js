const mongoose = require('mongoose')

const addressSchema = mongoose.Schema({
    firstName: {
        type: String,
        require: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    address1: {
        type: String,
        require: true
    },
    address2: {
        type: String,
        require: false
    },
    postalCode: {
        type: String,
        require: true
    },
    city: {
        type: String,
        require: true
    },
    state: {
        type: String,
        require: true
    },
    country: {
        type: String,
        require: true
    },
    saveAddressAs: {
        type: String,
        enum: ['Home', 'Office', 'Other'],
        require: true
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('address', addressSchema)