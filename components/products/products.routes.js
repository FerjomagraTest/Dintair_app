const router = require('express').Router()
const productsControllers = require('./products.controllers')

router.get('/Dintair/index/products', productsControllers.productsIndexView)

router.get('/Dintair/products/add/Product', isLoggedIn, productsControllers.createProductViews)

router.post('/Dintair/products/addmultiple', isLoggedIn, productsControllers.createProductPost)

router.get('/Dintair/kindProduct', isLoggedIn, productsControllers.kindProduct)

function isLoggedIn(req,res,next){
    if (req.isAuthenticated()){
      return next()
    } 
    return res.redirect('/Dintair/es/Signin')
}

module.exports = router;