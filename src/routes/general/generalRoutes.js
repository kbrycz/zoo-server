const express = require('express')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const requireAuth = require('../../middlewares/requireAuth')
const router = express.Router()

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


module.exports = router