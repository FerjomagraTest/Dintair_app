const router = require('express').Router()
const passwordResetControllers = require('./passwordReset.controllers')

router.get('/Dintair/passwordReset/new', passwordResetControllers.passwordReset)

router.post('/Dintair/passwordReset/new', passwordResetControllers.passwordResetPost)

router.get('/Dintair/passwordReset', passwordResetControllers.passwordResetView)

router.get('/Dintair/passwordReset/new/procedure/:token', passwordResetControllers.passwordResetToken)

router.post('/Dintair/passwordReset/new/procedure/:token', passwordResetControllers.passwordResetTokenPut)

module.exports = router;