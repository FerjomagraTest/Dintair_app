const router = require('express').Router()
const loginController = require('./login.controllers')
const passport = require('passport')

router.get('/Dintair/es/Signin', loginController.loginRoute)

router.post('/Dintair/es/Signin', passport.authenticate('local-signin', {
    successRedirect: '/Dintair',
    failureRedirect: '/Dintair/es/Signin',
    failureFlash: true
}))

router.get('/Dintair', isLoggedIn, loginController.homePage)

function isLoggedIn(req,res,next){
    if (req.isAuthenticated()){
      return next()
    } 
    return res.redirect('/Dintair/es/Signin')
}

module.exports = router;