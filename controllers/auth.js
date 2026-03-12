const express = require('express')
const router = express.Router()
const User = require("../models/user")
const bcrypt = require('bcrypt')

router.get('/sign-up', (req, res) => {
    res.render('auth/sign-up.ejs', {message: ""})
})

router.post('/sign-up', async (req, res) => {
    try {
        const { username, password, confirmPassword }  = req.body
        
        // Usernames need to be unique: two people can’t share the same username!
        const foundUser = await User.findOne({ username: username})

        if(foundUser){
            throw new Error(`User with username ${username} already exist.`)
        }

        // The password and confirmPassword fields must match to verify there were no typos.
        if( password !== confirmPassword){
            throw new Error("Password and password confirm do not match")
        }

        // Passwords cannot be stored directly as plain-text in the database, this is not secure.;
        // @todo billie - check salt rounds env
        // process.env.SALTROUNDS 
        const hashedPassword = bcrypt.hashSync(password, 8);
        const user = await User.create({
            username,
            hashedPassword
        })

        res.status(200).json(user)
    } catch (error) {
        res.render('auth/sign-up', { message: error.message })
    }
})

router.get('/sign-in', (req, res) => {
    res.render('auth/sign-in', {message: ''})
})

router.post('/sign-in', async (req, res) => {
    const {username, password } = req.body
    try {
        // Retrieve the user from the database using the username
        const foundUser = await User.findOne({ username }) // {username: username}
        
        if(!foundUser){
            throw new Error(`User with username ${username} does not exist. Please sign up.`)
        }

        // Compare the users password from the form to the hashedPassword on the foundUser
        const isValidPassword = bcrypt.compareSync(password, foundUser.hashedPassword)

        if(!isValidPassword){
            throw new Error("Password Incorrect, please try again")
        }

        // Handle actually signing in the user
        // add the users name and id onto the session
        req.session.user = {
            _id: foundUser._id,
            username: foundUser.username
        }

        // save the session to mongodb
        req.session.save(()=> {
            res.redirect('/')
        })

    } catch (error) {
        res.render('auth/sign-in', { message: error.message })
    }
})


router.get('/sign-out', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
})
module.exports = router