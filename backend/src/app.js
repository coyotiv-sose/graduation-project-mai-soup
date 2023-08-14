const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const mongoose = require('mongoose')
const User = require('./models/user')
const passport = require('passport')

require('./database-connection')

// passport setup
passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const librariesRouter = require('./routes/libraries')
const booksRouter = require('./routes/books')

const app = express()

app.use(cors())

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

const connectionPromise = mongoose.connection
  .asPromise()
  .then(connection => (connection = connection.getClient()))

// session setup
app.use(
  session({
    store: MongoStore.create({
      clientPromise: connectionPromise,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    // in production, cookies should be set to https only
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      // max age of 2 weeks
      maxAge: 1000 * 60 * 60 * 24 * 14,
    },
  })
)
app.use(passport.session())

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/libraries', librariesRouter)
app.use('/books', booksRouter)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
