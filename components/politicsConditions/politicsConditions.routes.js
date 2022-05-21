const router = require('express').Router()
const politicsControllers = require('./politicsConditions.controllers')

router.get('/Dintair/privacyPolice', politicsControllers.politicsView)
router.get('/Dintair/termsOfUse', politicsControllers.conditionsView)

module.exports = router;