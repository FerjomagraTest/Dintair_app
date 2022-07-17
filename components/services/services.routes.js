const router = require('express').Router()
const indexControllers = require('./services.controllers')

router.get('/Dintair/services/add/Service', isLoggedIn, indexControllers.createServiceViews)

router.post('/Dintair/services/addmultiple', isLoggedIn, indexControllers.createServicePost)

router.get('/Dintair/services/view/:id', isLoggedIn, indexControllers.serviceViewDetail)

router.get('/Dintair/services/edit/:id', isLoggedIn, indexControllers.editServiceView)

router.post('/Dintair/services/addmultiple/:id', isLoggedIn, indexControllers.editServicePut)

router.post('/Dintair/services/view/delete/:id/:nombre', isLoggedIn, indexControllers.deleteServicePut)


function isLoggedIn(req,res,next){
    if (req.isAuthenticated()){
      return next()
    } 
    return res.redirect('/Dintair/es/Signin')
}

module.exports = router;