const router = require('express').Router()
const marketsControllers = require('./markets.controllers')

router.get('/Dintair/markets/list', isLoggedIn, marketsControllers.marketsList)

function isLoggedIn(req,res,next){
    if (req.isAuthenticated()){
      return next()
    } 
    return res.redirect('/Dintair/es/Signin')
}

module.exports = router;

