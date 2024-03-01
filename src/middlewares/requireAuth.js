const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = mongoose.model('User')

// Makes sure that the current user is authorized
// Used as middleware for personal requests
// addes req.user to all requests after it
module.exports = (req, res, next) => {
    const {authorization} = req.headers
    if (!authorization) {
        console.log("User is not logged in. Does not have valid authorization")
        return res.status(401).send({error: 'You must be logged in.'})
    }

    const token = authorization.replace('Bearer ', '')
    jwt.verify(token, secrets.process.env, async (err, payload) => {
        if (err) {
            console.log("User is not logged in. Error in verifying token.")
            return res.status(401).send({error: 'You must be logged in.'})
        }
        const { userId } = payload
        const user = await User.findById(userId)
        req.user = user
        console.log("Sucessfully verified user is logged in.")
        next()
    })
}