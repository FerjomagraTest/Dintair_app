const controller = {}

controller.baseRoute = (req,res) => {
    res.render('views/spanish/Principal',{
        message : req.flash('messagesend'),
        messageReset : req.flash('resetMessage')
    })
}

    
module.exports = controller;