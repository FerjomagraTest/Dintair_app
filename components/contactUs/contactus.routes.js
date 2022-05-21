const router = require('express').Router()
const contactUsControllers = require('./contactus.controllers')

router.get('/Dintair/contact', contactUsControllers.contactusView)
router.post('/Dintair/contact/us', contactUsControllers.contactusPost)

module.exports = router;