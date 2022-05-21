const router = require('express').Router()
const logoutControllers = require('./logout.controllers')

router.get('/logout', logoutControllers.logout)

module.exports = router;