const router = require('express').Router()
const productsControllers = require('./products.controllers')

router.get('/Dintair/index/products', productsControllers.productsIndexView)

router.get('/Dintair/products/add/Product', isLoggedIn, productsControllers.createProductViews)

router.post('/Dintair/products/addmultiple', isLoggedIn, productsControllers.createProductPost)

router.get('/Dintair/kindProduct', isLoggedIn, productsControllers.kindProduct)

router.get('/Dintair/products/view/:id', isLoggedIn, productsControllers.viewMyProductDetail)

router.get('/Dintair/products/edit/:id', isLoggedIn, productsControllers.productsEditView)

router.post('/Dintair/products/addmultiple/:id', isLoggedIn, productsControllers.editProductPost)

router.post('/Dintair/products/view/delete/:id/:nombre', isLoggedIn, productsControllers.deleteProduct)

router.get('/Dintair/products/user/view/:id', isLoggedIn, productsControllers.viewAnotherProduct)

function isLoggedIn(req,res,next){
    if (req.isAuthenticated()){
      return next()
    } 
    return res.redirect('/Dintair/es/Signin')
}

module.exports = router;