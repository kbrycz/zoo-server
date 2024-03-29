const express = require('express')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const requireAuth = require('../../middlewares/requireAuth')
const fs = require('fs')
var uuid = require('uuid');
const router = express.Router()

// Gets the data of the user and returns it back to them 
router.get('/getUserData', requireAuth, async (req, res) => {
    if (!req.user) {
        console.log("Local user does not exist")
        return res.status(422).send({error: 'User does not exist'})
    }
    try {
        console.log("Sending the local user back to local user")
        return res.send({user: req.user, random: uuid.v4()})
    }
    catch (err) {
        console.log("Unable to send local user info")
        return res.status(422).send({error: 'Unable to send local user info'})
    }
})

// Gets the data of the user from '_id' field and returns it back to them 
// req.query._id contains the id of the user requested
router.get('/getUserDataWithId', async (req, res) => {
    const user = await User.findOne({_id: req.query._id})
    if (!user) {
        console.log("user with id does not exist")
        return res.status(422).send({error: 'user with id does not exist'})
    }
    try {
        console.log("Sending the user with id back to local user")
        res.send({user: user, random: uuid.v4()})
    }
    catch (err) {
        console.log("Unable to send other user info")
        return res.status(422).send({error: 'Unable to send other user info'})
    }
})

// Deletes the user from the system
router.delete('/deleteUser', requireAuth, async (req, res) => {
    try {

        // Get the local user
        let user = await User.findOne({_id: req.user._id})
        if (!user) { 
            throw "User not found with id"
        }

        // Finally delete the actual user object
        await User.deleteOne({_id: req.user._id})
        console.log("Successfully deleted user!")
        return res.send({isGood: true})
    }
    catch (err) {
        console.log("Unable to delete user : ", err.message)
        return res.status(422).send({error: err.message})
    }
})

// Changes the work of the user
router.post('/updateExpoToken', requireAuth, async (req, res) => {
    try {
        const { expoToken } = req.body

        User.findOne({_id: req.user._id}, (err, user) => {
            user.expoToken = expoToken
            user.save(() => {
                console.log("User updated expo token info")
                return res.send({user})
            })
        })
    }
    catch (err) {
        console.log("Unable to update expo token: " + err.message)
        return res.status(422).send({error: err.message})
    }
})

// Search for a user by phone number
router.get('/searchByPhoneNumber', async (req, res) => {
    const { phone } = req.query;
    console.log(`Searching for user by phone number: ${phone}`);

    try {
        const user = await User.findOne({ phone: phone });
        if (!user) {
            console.log(`User not found with phone number: ${phone}`);
            return res.status(404).send({ error: 'User not found' });
        }
        console.log(`User found with phone number: ${phone}`);
        res.send({ user });
    } catch (err) {
        console.error(`Error searching user by phone number: ${phone}`, err);
        res.status(500).send({ error: 'Search failed' });
    }
});

// Search for users by first and last name
router.get('/searchByName', async (req, res) => {
    const { firstName, lastName } = req.query;
    console.log(`Searching for users by name: ${firstName} ${lastName}`);

    try {
        const users = await User.find({ 
            first: { $regex: firstName, $options: 'i' }, 
            last: { $regex: lastName, $options: 'i' }
        });

        if (!users.length) {
            console.log(`No users found with name: ${firstName} ${lastName}`);
            return res.status(404).send({ error: 'No users found' });
        }

        console.log(`Found ${users.length} users with name: ${firstName} ${lastName}`);
        res.send({ users });
    } catch (err) {
        console.error(`Error searching for users by name: ${firstName} ${lastName}`, err);
        res.status(500).send({ error: 'Search failed' });
    }
});




module.exports = router