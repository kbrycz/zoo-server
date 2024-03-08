const express = require('express')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const requireAuth = require('../../middlewares/requireAuth')
const fs = require('fs')

const router = express.Router()

// Get all the points leaders
router.get('/getLeaderboard', requireAuth, async (req, res) => {
    try {
        let leaders = []

        let tempLeaders = await User.find().sort({ lifetimeRewards: 'desc'})
        for (let i = 0; i < 10; ++i) {
            if (i >= tempLeaders.length) { break }
            let leader = {
                first: tempLeaders[i].first,
                profilePhoto: tempLeaders[i].profilePhoto,
                lifetimeRewards: tempLeaders[i].lifetimeRewards
            }
            leaders.push(leader)
        }
        console.log("Successfully sending all leaders")
        return res.send({leaders: leaders})
    }   
    catch (err) {
        console.log("Error sending leaders")
        console.log(err)
        return res.status(422).send({error: "Error sending leaders"})
    }
})

module.exports = router