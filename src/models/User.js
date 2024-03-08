const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')

// Schema for the user objects
const userSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true
    },
    dateJoined: {
        type: Date
    },
    first: {
        type: String,
        required: true
    },
    last: {
        type: String,
        required: true
    },
    birthdate: {
        type: Date,
    },
    gender: {
        type: Number,
    },
    currentRewards: {
        type: Number
    },
    lifetimeRewards: {
        type: Number
    },
    profilePhoto: {
        type: String
    },
    expoToken: {
        type: Array
    },
    notifications: {
        type: Boolean,
        required: true,
        default: true
    }
})

mongoose.model('User', userSchema)