const router = require('express').Router()
const indexPageController = require('./indexPage.controllers')


router.get('/', indexPageController.baseRoute)

module.exports = router;