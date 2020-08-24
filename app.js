const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const passport = require('passport')
const { Mongoose } = require('mongoose')


// load config
dotenv.config({ path: './config/config.env' })

//passport config
require('./config/passport')(passport)



connectDB()

const app = express()

//Body Parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json()) //we are also getting the jsonn data

//logging 
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

//Handlebars helpers
const { formatDate, stripTags, truncate } = require('./helpers/hbs')


//Handlebars
app.engine('.hbs', exphbs({
    helpers: {
        formatDate,
        truncate,
        stripTags,
    },
    defaultLayout: 'main',
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

//sessions
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false, //dont create a session until something is stored
    // cookie: { secure: true }  commented this as we dont need it its only used for https
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}))

//passport middleware
app.use(passport.initialize())
app.use(passport.session())


// static folder
app.use(express.static(path.join(__dirname, 'public')))

//Routes
app.use(`/`, require('./routes/index'))
app.use(`/auth`, require('./routes/auth'))
app.use(`/stories`, require('./routes/stories'))


const PORT = process.env.PORT || 3000
app.listen(
    PORT,
    console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);