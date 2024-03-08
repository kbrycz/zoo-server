const express = require('express')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const requireAuth = require('../../middlewares/requireAuth')
const router = express.Router()

// Changes the name of the user and returns user object to user
router.post('/changeName', requireAuth, async (req, res) => {
    const {first, last} = req.body

    if (!first || !last) {
        console.log("Error with first and last names passed in")
        return res.status(422).send({error: "Error with first and last names passed in"})
    }
    try {
        User.findOne({_id: req.user._id}, (err, user) => {
            user.first = first
            user.last = last
            user.save(() => {
                console.log("User updated first and last name")
                return res.send({user})
            })
        })
    }
    catch (err) {
        return res.status(422).send({error: err.message})
    }
})


// Changes the location of the user
router.post('/changeLocation', requireAuth, async (req, res) => {
    const { location } = req.body

    if (!location) {
        console.log("Error with location variable passed to server")
        return res.send({user: req.user})
    }
    try {
        User.findOne({_id: req.user._id}, (err, user) => {
            let locationInfo = {
                zip: location.zip,
                city: location.city,
                state: location.state
            }
            let array = []
            array.push(location.long)
            array.push(location.lat)
            let tempLocation = {
                type: 'Point',
                coordinates: array
            }
            user.location = tempLocation
            user.locationInfo = locationInfo
            user.save(() => {
                console.log("User updated location info")
                return res.send({user})
            })
        })
    }
    catch (err) {
        console.log("Unable to update location info: " + err.message)
        return res.status(422).send({error: err.message})
    }
})


// Changes the birthdate of the user and returns the user object to user
router.post('/changeBirthdate', requireAuth, async (req, res) => {
    const {birthdate} = req.body

    if (!birthdate) {
        console.log("Error with changing birthdate")
        return res.status(422).send({error: 'Error with changing birthdate'})
    }
    try {
        User.findOne({_id: req.user._id}, (err, user) => {
            user.birthdate = birthdate
            user.save(() => {
                console.log("User updated birthdate info")
                return res.send({user})
            })
        })
    }
    catch (err) {
        return res.status(422).send({error: err.message})
    }
})

// Changes the notification settings of the user
router.post('/changeNotifications', requireAuth, async (req, res) => {
    const { notifications } = req.body

    if (notifications === null) {
        console.log("error with notifications variable")
        return res.status(422).send({error: 'Must provide notifications'})
    }
    try {
        User.findOne({_id: req.user._id}, (err, user) => {
            user.notifications = notifications
            user.save(() => {
                console.log("User updated notifications object")
                return res.send({user})
            })
        })
    }
    catch (err) {
        console.log("Error with changing the hideStatus: " + err.message)
        return res.status(422).send({error: err.message})
    }
})

module.exports = router