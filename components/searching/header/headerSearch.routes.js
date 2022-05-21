const router = require('express').Router()
const headerSearchControllers = require('./headerSearch.controllers')

router.post('/Dintair/search-header', headerSearchControllers.headerSearching)

module.exports = router;