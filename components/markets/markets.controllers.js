const User = require('../users/models/user')
const controller = {}

controller.marketsList = (req,res) => {
    User.find({}).exec((err, usuarios)=>{
        if(err){
          res.redirect('/Dintair')
          return
        }
        res.render('views/spanish/markets/marketsList',{
          user:req.user,
          usuarios: usuarios.reverse()
        })
    });
}

module.exports = controller;