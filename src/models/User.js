const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')

// Schema for the user objects
const userSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true
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
    }
})

// Allows the location to be sortable
userSchema.index({ location: "2dsphere" });

mongoose.model('User', userSchema)