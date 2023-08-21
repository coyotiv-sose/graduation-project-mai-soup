const createError = require('http-errors')
const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const mongoose = require('mongoose')
const passport = require('passport')
const User = require('./models/user')

require('./database-connection')

// passport setup
passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const librariesRouter = require('./routes/libraries')
const bookInfoRouter = require('./routes/books')
const bookCopiesRouter = require('./routes/copies')
const accountsRouter = require('./routes/accounts')

const app = express()

app.use(
  cors({
    origin: true,
    credentials: true,
  })
)

const connectionPromise = mongoose.connection
  .asPromise()
  // eslint-disable-next-line no-return-assign, no-param-reassign
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
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      // max age of 2 weeks
      maxAge: 1000 * 60 * 60 * 24 * 14,
    },
  })
)
app.use(passport.session())

app.set('trust proxy', 1)
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/libraries', librariesRouter)
app.use('/books', bookInfoRouter)
app.use('/copies', bookCopiesRouter)
app.use('/accounts', accountsRouter)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  const { message } = err
  const error = req.app.get('env') === 'development' ? err : {}

  res.status(err.status || 500)
  res.send({ message, error })
})

module.exports = app
