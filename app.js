require('dotenv').config();

const express = require('express')
const app = express()
const path = require('path')
const morgan = require('morgan')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const passport = require('passport')
const session = require('express-session')
const bodyParser = require('body-parser')
const { error404, error500 } = require('./middleware/errors');

//db-connection
const {url} = require('./config/development')
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true});
require('./components/login/tools/passport')(passport)
require('./components/signUp/tools/passport')(passport)

//Router
app.use(morgan('dev'))

//Body objects
app.use(bodyParser.json())
//app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.urlencoded({parameterLimit: 100000, limit: '20mb', extended: true }))

//Passport
app.use(session({
    secret: 'dintair',
    resave: false,
    saveUninitialized: false
  }));
  
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())



//view engine setup
app.set('views', path.join(__dirname, 'frontend'))
app.set('view engine', 'jade')



//views  routes
//index
var loginRouter = require('./components/login/login.routes.js')
var indexRouter = require('./components/indexPage/indexPage.routes.js')
var passwordResetRouter = require('./components/passwordReset/passwordReset.routes.js')
var signupRouter = require('./components/signUp/signUp.routes.js')
var restrcitedProductsRouter = require('./components/restrictedProducts/restrictedProducts.routes.js')
var productsRouter = require('./components/products/products.routes.js')
var contactusRouter = require('./components/contactUs/contactus.routes')
var politicsConditionsRouter = require('./components/politicsConditions/politicsConditions.routes')
var logoutRoutes = require('./components/logout/logout.routes')

//user interface
var headerSearchRoutes = require('./components/searching/header/headerSearch.routes')

app.use('/',
  indexRouter,
  loginRouter,
  passwordResetRouter,
  signupRouter,
  restrcitedProductsRouter,
  productsRouter,
  contactusRouter,
  politicsConditionsRouter,
  logoutRoutes,
  
  //userInterface
  headerSearchRoutes,

)
//login


//static files
app.use(express.static(path.join(__dirname, 'public')))


//Errors
app.use(error404)
app.use(error500)

module.exports = app