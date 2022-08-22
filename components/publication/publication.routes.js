const router = require('express').Router()
const publicationController = require('./publication.controllers')

router.get('/Dintair/recommendations/board', isLoggedIn, publicationController.publicationIndex)

router.get('/Dintair/dashboard/myBox/product/:id', isLoggedIn, publicationController.lookingForCustomers)

router.get('/Dintair/create/publication', isLoggedIn, publicationController.createPublicationView)

router.post('/Dintair/create/publication', isLoggedIn, publicationController.createPublicationPost)

router.post('/Dintair/create/publication/progress-prev', isLoggedIn, publicationController.recommendationLoader)

router.get('/Dintair/dashboard/myBox/service/:id', isLoggedIn, publicationController.dashboardServices)

router.get('/Platform/recommendation-search/:page', isLoggedIn, publicationController.searchingProductsRecommendations)

router.get('/Platform/service/recommendation-search/:page', isLoggedIn, publicationController.searchingServicesRecommendations)

router.post('/Platform/recommendation-email', isLoggedIn, publicationController.emailListPost)

function isLoggedIn(req,res,next){
    if (req.isAuthenticated()){
      return next()
    } 
    return res.redirect('/Dintair/es/Signin')
}

module.exports = router;