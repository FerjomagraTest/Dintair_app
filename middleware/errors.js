module.exports.error404 = function (req, res, next) {
    let error = new Error(),
        locals = {
            title: 'Error 404',
            description: 'Recurso no hallado',
            error: error
        }

    error.status = 404

    res.render('views/spanish/errorsviews/error', locals)
    next()
}

module.exports.error500 = function (req, res, next) {
    let error = new Error(),
        locals = {
            title: 'Error 500',
            description: 'Recurso no hallado',
            error: error
        }

    error.status = 500

    res.render('views/spanish/errorsviews/error', locals)
    next()
}