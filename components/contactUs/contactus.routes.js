const router = require('express').Router()
const contactUsControllers = require('./contactus.controllers')

router.get('/Dintair/contact', contactUsControllers.contactusView)

router.post('/Dintair/contact/us', contactUsControllers.contactusPost)

//userInterface

router.get('/Dintair/contact/us', isLoggedIn, contactUsControllers.contactUserInterface)

router.post('/Dintair/suggestions', isLoggedIn, contactUsControllers.contactUserInterfacePost)

function isLoggedIn(req,res,next){
    if (req.isAuthenticated()){
      return next()
    } 
    return res.redirect('/Dintair/es/Signin')
}

module.exports = router;