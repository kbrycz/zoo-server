const mongoose = require('mongoose')

// Schema for the post objects
const animalSchema = new mongoose.Schema({
    group: {
        type: Number
    },
    name: {
        type: String
    },
    species: {
        type: String
    },
    dateAddedToZoo: {
        type: Date
    },
    dateLeftToZoo: {
        type: Date
    },
    birthdate: {
        type: Date
    },
    deathDate: {
        type: Date
    },
    picture: {
        type: String
    },
    link: {
        type: String
    },
    cardFeatures: {
        type: Object
    }
}, { timestamps: true })

animalSchema.index({createdAt: 1});

mongoose.model('Animal', animalSchema)