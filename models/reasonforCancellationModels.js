const mongoose = require('mongoose')

const reasonforCancellationSchema = mongoose.Schema({
    reasonName: {
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

module.exports = mongoose.model('reason', reasonforCancellationSchema);