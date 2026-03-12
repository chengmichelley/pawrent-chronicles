require('dotenv').config()

const express = require('express')
const app = express()
const PORT = process.env.IS_DEV ? 3000 : process.env.PORT
const morgan = require('morgan')
const methodOverride = require('method-override')
const authRoutes = require('./controllers/auth')
const userRoutes = require('./controllers/user')

const session = require('express-session')
const MongoStore = require("connect-mongo")
const authRequired = require('./middleware/isUserAuthorized')
const passDataToView = require('./middleware/passDataToView')

// Middlewares
require('./db/connection')
app.use(morgan('tiny'))
app.use(express.urlencoded({extended: true}))
app.use(methodOverride("_method"))
// Set view engine to ejs

app.set('view engine', 'ejs') // When this is present we dont need .ejs in our res.renders

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    // cookie: {
    //     maxAge: 1000000000000000000,
    // },
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    })
}))
// Any routes under this will automatically have user passed to it (if a user is logged in)
app.use(passDataToView)

//Routes
app.get('/', (req, res) => {
    res.render('index', {
        user: req.session.user
    })
})

app.use('/auth', authRoutes)

// Any routes defined under this middleware require auth
app.use(authRequired)
app.use('/users', userRoutes)

app.listen(PORT, ()=> console.log(`The port is running on: ${PORT}`))