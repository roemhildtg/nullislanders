const express = require('express')
const session = require('express-session')
const path = require('path')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const passport = require('passport')
const flash = require('connect-flash')
const expressValidator = require('express-validator')
const routes = require('./routes')
const helpers = require('./helpers')
const errorHandlers = require('./handlers/errorHandlers')
var request = require('request')
// create our Express app
const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'templates'))
app.set('view engine', 'ejs') // we use the engine pug, mustache or EJS work great too

app.use(express.static(path.join(__dirname, 'public')))

// Takes the raw requests and turns them into usable properties on req.body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true, }))

app.use(passport.initialize())
app.use(passport.session())

// Exposes a bunch of methods for validating data. Used heavily on userController.validateRegister
app.use(expressValidator())

// populates req.cookies with any cookies that came along with the request
app.use(cookieParser())

// Sessions allow us to store data on visitors from request to request
// This keeps users logged in and allows us to send flash messages
app.use(
  session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, },
  })
)

// Passport JS is what we use to handle our logins
app.use(passport.initialize())
app.use(passport.session())

// The flash middleware let's us use req.flash('error', 'Shit!')
app.use(flash())

// pass variables to our templates + all requests
app.use((req, res, next) => {
  res.locals.h = helpers
  res.locals.flashes = req.flash()
  res.locals.user = req.user || null
  res.locals.currentPath = req.path
  next()
})

app.use(async (req, res, next) => {
  req.login = await (req.login, req)
  next()
})

// After allllll that above middleware, we finally handle our own routes!
app.use('/', routes)

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound)

// One of our error handlers will see if these errors are just validation errors
app.use(errorHandlers.flashValidationErrors)

// Otherwise this was a really bad error we didn't expect! Shoot eh
if (app.get('env') === 'development') {
  /* Development Error Handler - Prints stack trace */
  app.use(errorHandlers.developmentErrors)
}

// production error handler
app.use(errorHandlers.productionErrors)

// done! we export it so we can start the site in start.js
module.exports = app
