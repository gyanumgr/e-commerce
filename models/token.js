const mongoose = require('mongoose')

const token = new mongoose.Schema({
    _userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    token:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        required: true,
        default: Date.now,
        expires: 43200
    }
})

const Token  = mongoose.model('Token', token)
module.exports = Token