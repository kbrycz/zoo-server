const mongoose = require('mongoose')

// Schema for the post objects
const postSchema = new mongoose.Schema({
    postType: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    picture: {
        type: String,
        required: true
    },
    link: {
        type: String
    }
}, { timestamps: true })

postSchema.index({createdAt: 1}, {expires: '360d'});

mongoose.model('Post', postSchema)