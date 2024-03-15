const express = require('express');
const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const requireAuth = require('../../middlewares/requireAuth');
const fs = require('fs');
const router = express.Router();
const path = require('path');

// Submits a post
router.post('/submitPost', requireAuth, async (req, res) => {
    const { post, picture } = req.body;

    if (!post) {
        console.log("Error with post value");
        return res.status(422).send({ error: 'Must fill out all fields' });
    }

    try {
        // If there's an image, save it to the filesystem
        if (picture && picture.image && picture.imageName) {
            const imagePath = path.join('uploads', 'events', picture.imageName);
            await fs.promises.writeFile(imagePath, picture.image, 'base64');
            post.picture = imagePath; // Store the path in the post object
        }

        const newPost = new Post(post);
        await newPost.save();
        console.log("User submitted post successfully");
        return res.send({ post: newPost });
    } catch (err) {
        console.log("Unable to submit post: " + err.message);
        return res.status(422).send({ error: err.message });
    }
});

// Gets all the posts that the user should be seeing on their feed
router.get('/getPosts', requireAuth, async (req, res) => {
    try {
        const LIMIT = 10;
        const posts = await Post.find().sort({ createdAt: -1 }).limit(LIMIT);
        console.log("Fetched posts successfully");
        return res.send(posts);
    } catch (err) {
        console.log("Unable to send all posts: " + err.message);
        return res.status(422).send({ error: 'Unable to send all posts' });
    }
});

// Deletes the post from the db
router.delete('/deletePost', requireAuth, async (req, res) => {
    try {
        const { postId } = req.body;

        if (!postId) {
            console.log("Error with postId value");
            return res.status(422).send({ error: 'postId not passed to server' });
        }

        const result = await Post.deleteOne({ _id: postId });
        if (result.deletedCount === 0) {
            throw new Error('Post not found or already deleted');
        }
        console.log("Post deleted successfully");
        return res.send({ isDeleted: true });
    } catch (err) {
        console.log("Unable to delete post: " + err.message);
        return res.status(422).send({ error: err.message });
    }
});

module.exports = router;
