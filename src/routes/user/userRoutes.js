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
    try {
        const { phoneNumber } = req.query;
        const user = await User.findOne({ phoneNumber: `+1${phoneNumber}` });
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        res.send({ user });
    } catch (err) {
        console.log("Search by phone number failed: ", err.message);
        res.status(500).send({ error: 'Search failed' });
    }
});

// Search for users by first and last name
router.get('/searchByName', async (req, res) => {
    try {
        const { firstName, lastName } = req.query;
        const users = await User.find({ 
            firstName: { $regex: firstName, $options: 'i' }, 
            lastName: { $regex: lastName, $options: 'i' } 
        });
        if (!users.length) {
            return res.status(404).send({ error: 'No users found' });
        }
        res.send({ users });
    } catch (err) {
        console.log("Search by name failed: ", err.message);
        res.status(500).send({ error: 'Search failed' });
    }
});



module.exports = router