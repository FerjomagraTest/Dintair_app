const controller = {}

controller.politicsView = (req,res) => {

    res.render('views/spanish/privacyPolice/politics', {
        message : req.flash('messagesend'),
        messageReset : req.flash('resetMessage')
    })
}

controller.conditionsView = (req,res) => {

    res.render('views/spanish/privacyPolice/conditions', {
        message : req.flash('messagesend'),
        messageReset : req.flash('resetMessage')
    })
}

module.exports = controller;