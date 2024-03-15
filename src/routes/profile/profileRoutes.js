const express = require('express')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const requireAuth = require('../../middlewares/requireAuth')
const fs = require('fs')

const router = express.Router()

// Saves the profilePicture of the user
router.post('/saveProfilePicture', requireAuth, async (req, res, next) => {

    const { profilePicture } = req.body

    try {
        let user = await User.findOne({_id: req.user._id})

        if (!user) {
            throw "User does not exist"
        }

        // If user is deleting prof picture
        if (!profilePicture) {
            if (user.profilePicture.length > 0) {
                await fs.promises.unlink("uploads/" + user.profilePicture)
            }
            user.profilePicture = ''
            await user.save()
            console.log("User has removed profilePicture")
            return res.send({user: user})
        }

        await fs.promises.writeFile('./uploads/profilePictures/' + profilePicture.imageName, profilePicture.image, 'base64')
        user.meme = 'profilePictures/' + meme.imageName
        await user.save()

        console.log("Saving profilePicture")
        return res.send({user: user})
    }
    catch (err) {
        console.log("Unable to save profilePicture: " + err.message)
        return res.status(422).send({error: err.message})
    }
})

module.exports = router