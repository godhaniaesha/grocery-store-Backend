const mongoose = require('mongoose')

const coupenSchema = mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    coupenType: {
        type: String,
        enum: ['Fixed', 'Percentage'],
        require: true
    },
    coupenDiscount: {
        type: String,
        require: true
    },
    startDate: {
        type: String,
        require: true
    },
    endDate: {
        type: String,
        require: true
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('coupen', coupenSchema)