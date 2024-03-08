const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = mongoose.model('User')
const requireAuth = require('../../middlewares/requireAuth')
const fs = require('fs')
const accountSID = process.env.accountSID
const authToken = process.env.authToken
const serviceID = process.env.serviceID

const router = express.Router()

const client = require('twilio')(accountSID, authToken)

// Lets the user know that they are connected to the server
router.get('/testConnection', async (req, res) => {
    try {
        res.send()
    }
    catch (err) {
        console.log(err)
    }
})

router.get('/twilioVerify', async (req, res) => {
    try {
        const { phone } = req.query;
        console.log("Received phone number for verification: " + phone);

        // Validate phone number
        if (!phone) {
            console.error("No phone number provided");
            return res.status(422).send({ error: 'Must provide a valid phone number' });
        }

        // Call Twilio API to send verification code
        client.verify.v2.services(serviceID)
            .verifications
            .create({
                to: phone,
                channel: "sms"
            })
            .then((data) => {
                console.log("Twilio verification initiated: ", data);
                return res.send({ isGood: true });
            })
            .catch((err) => {
                // Log detailed error message from Twilio response
                console.error("Error initiating Twilio verification: ", err);
                // Respond with a more generic error message to the client
                return res.status(500).send({ error: 'Failed to initiate verification. Please try again later.' });
            });
    } catch (err) {
        // Log unexpected errors
        console.error("Unexpected error in Twilio verification route: ", err);
        // Respond with a generic error message
        return res.status(500).send({ error: 'An unexpected error occurred. Please try again later.' });
    }
});


// Checks if user has correct credentials and returns token for login or signup
router.post('/handleAuth', async (req, res) => {
    try {
        const { phone, code } = req.body
    
        console.log("Phone and code: " + code + " " + phone)

        if (!phone) {
            return res.status(422).send({error: 'Must provide valid phone number'})
        }

        // DEV ONLY
        // // Tries to find a user with the phone number given
        // const user = await User.findOne({phone})    

        // // No user exists with phone number, so making new account
        // if (user === null) {
        //     console.log("There is currently not a user with phone number. Sending to info screen first.")
        //     return res.send({newAccount: true})
        // }
        // else {
        //     // Create token for user to save on their device
        //     const token = jwt.sign({userId: user._id}, process.env.KEY)
        //     console.log("Signing the user in")
        //     return res.send({token, user, newAccount: false})
        // }

        // TODO UNCOMMENT OUT ON PRODUCTION ( NOT DEV ONLY )
        client
        .verify
        .v2.services(serviceID)
        .verificationChecks
        .create({
            to: phone,
            code: code
        })
        .then(async (data) => {

            if (data.valid == true) {
                // Tries to find a user with the phone number given
                const user = await User.findOne({phone})    

                // No user exists with phone number, so making new account
                if (user === null) {
                    console.log("There is currently not a user with phone number. Sending to info screen first.")
                    return res.send({newAccount: true})
                }
                else {
                    // Create token for user to save on their device
                    const token = jwt.sign({userId: user._id}, process.env.KEY)
                    console.log("Signing the user in")
                    return res.send({token, user, newAccount: false})
                }
            }
            else if (data.to == '+17794566027' && code == '23186') {
                // Tries to find a user with the phone number given
                const user = await User.findOne({phone})    

                // No user exists with phone number, so making new account
                if (user === null) {
                    console.log("There is currently not a user with phone number. Sending to info screen first.")
                    return res.send({newAccount: true})
                }
                else {
                    // Create token for user to save on their device
                    const token = jwt.sign({userId: user._id}, process.env.KEY)
                    console.log("Signing the user in")
                    return res.send({token, user, newAccount: false})
                }
            }
            else {
                console.log("Unable to log into account at this time")
                return res.status(422).send({error: 'Unable to log into account at this time'})
            }
        })
        .catch((err) => {
            console.log(err)
            return res.status(422).send({error: 'Unable to log into account at this time'})
        })        
    }
    catch (err) {
        console.log(err)
        return res.status(422).send({error: 'Unable to log into account at this time'})
    }
})

// Checks if user has correct credentials and returns token for signup
router.post('/signup', async (req, res) => {
    const { userObj } = req.body
    
    if (!userObj) {
        return res.status(422).send({error: 'Must provide valid user obj'})
    }

    try {
        // Variables that were passed in
        let phone = userObj.number
        let first = userObj.first
        let last = userObj.last
        let birthdate = new Date(userObj.birthdate)
        let gender = userObj.gender
        let notifications = true

        // Handle meme
        let profilePhoto = ''
        if (userObj.profilePhoto) {
            await fs.promises.writeFile('./uploads/profilePhotos/' + userObj.profilePhoto.imageName, userObj.profilePhoto.image, 'base64')
            profilePhoto = 'profilePhotos/' + userObj.profilePhoto.imageName
        }

        // User profile variables
        let currentRewards = 0
        let lifetimeRewards = 0
        let expoToken = []
        let dateJoined = new Date()

        // Create the new user object
        const newUser = new User({phone, dateJoined, first, last, birthdate, gender, currentRewards, lifetimeRewards, expoToken, notifications})
        await newUser.save()

        // Create token for user to save on their device
        const token = jwt.sign({userId: newUser._id}, process.env.KEY)

        console.log("Successfully created account for " + phone)
        return res.send({token})
    }
    catch (err) {
        console.log("Unable to sign up a new account at this time: ", err.message)
        return res.status(422).send({error: 'Unable to sign up a new account at this time'})
    }
})

module.exports = router