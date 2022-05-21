const router = require('express').Router()
const restrictedProducts = require('./restrictedProducts.controllers')

router.get('/Dintair/aeropost', restrictedProducts.restrictedProducts)
router.post('/Dintair/aeropost/search', restrictedProducts.productListIndex)
router.get('/Dintair/product/:id', restrictedProducts.productListId)

module.exports = router;