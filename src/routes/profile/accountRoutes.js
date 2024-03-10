const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const requireAuth = require('../../middlewares/requireAuth');
const router = express.Router();

// Utility for logging and constructing error response
const logAndRespond = (err, res) => {
    console.error(err); // Log the error for server-side debugging
    res.status(422).send({ error: err.message });
};

// Changes the name of the user and returns user object to the user
router.post('/changeName', requireAuth, async (req, res) => {
    const { first, last } = req.body;

    if (!first || !last) {
        return res.status(422).send({ error: "Error with first and last names passed in" });
    }

    try {
        const user = await User.findOne({ _id: req.user._id });
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        user.first = first;
        user.last = last;
        await user.save();
        res.send({ user });
    } catch (err) {
        logAndRespond(err, res);
    }
});

// Changes the birthdate of the user and returns the user object to user
router.post('/changeBirthdate', requireAuth, async (req, res) => {
    const { birthdate } = req.body;

    if (!birthdate) {
        return res.status(422).send({ error: 'Error with changing birthdate' });
    }

    try {
        const user = await User.findOne({ _id: req.user._id });
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        user.birthdate = new Date(birthdate);
        await user.save();
        res.send({ user });
    } catch (err) {
        logAndRespond(err, res);
    }
});

// Changes the gender of the user
router.post('/changeGender', requireAuth, async (req, res) => {
    const { gender } = req.body;

    if (gender === undefined) {
        return res.status(422).send({ error: "Error with gender variable passed to server" });
    }

    try {
        const user = await User.findOne({ _id: req.user._id });
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        user.gender = gender;
        await user.save();
        res.send({ user });
    } catch (err) {
        logAndRespond(err, res);
    }
});

// Changes the notification settings of the user
router.post('/changeNotifications', requireAuth, async (req, res) => {
    const { notifications } = req.body;

    if (notifications === null) {
        return res.status(422).send({ error: 'Must provide notifications' });
    }

    try {
        const user = await User.findOne({ _id: req.user._id });
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        user.notifications = notifications;
        await user.save();
        res.send({ user });
    } catch (err) {
        logAndRespond(err, res);
    }
});

module.exports = router;
