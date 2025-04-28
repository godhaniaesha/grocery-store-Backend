const monggose = require('mongoose')

const TermsAndConditionSchema = monggose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = monggose.model('terms', TermsAndConditionSchema)