const router = require('express').Router()
const signupControllers = require('./signUp.controllers')
const passport = require('passport')

router.get('/Dintair/es/Signup', signupControllers.signUpView)

router.post('/Dintair/es/Signup', passport.authenticate('local-signup', {
    successRedirect: '/Dintair/preview/register',
    failureRedirect: '/Dintair/es/Signup',
    failureFlash: true
  })
)

router.get('/Dintair/preview/register', isLoggedIn, signupControllers.firstPostView)

router.post('/Dintair/profile/UltData/:id', isLoggedIn, signupControllers.updateFirstInfo)

function isLoggedIn(req,res,next){
  if (req.isAuthenticated()){
    return next()
  } 
  return res.redirect('/Dintair/es/Signin')
}

module.exports = router;