const User = require('../users/models/user')

const controller = {}

controller.signUpView = (req,res) => {

    res.render('views/spanish/signup/signupView', {
        message : req.flash('signupMessage'),
        check : req.flash('check'),
        messageReset : req.flash('resetMessage')
    })
}

controller.firstPostView = (req,res) => {
    var id_usuario = req.user.id

    User.findById({'_id': id_usuario}).populate('_id').exec(
      function(err, usuario){
        if(err){
          res.redirect('/Dintair/es/Signup')
          return
        }
        res.render('views/spanish/signup/firstPostView',{
          user: req.user,
          newUser: usuario
        })
      }
    )
}

controller.updateFirstInfo = (req,res) => {

    User.find({}).exec( function(err, doc){
      
        if(!err){
          var data_user = {
  
            //dato principal
            wtpnumber : req.body.wtpnumber,
            iam : req.body.iam,
            rubroTarget : req.body.rubroTarget,
            country : req.body.country,
            provincia : req.body.provincia,
            id_url : doc.length + 1
          }
  
          console.log(data_user)
  
          
          User.updateOne({'_id': req.params.id}, data_user, (usuarios) => {
            res.redirect('/Dintair')
          })
        } else {
            console.log(err)
            console.log('no actualizo');
        }
    })
}


module.exports = controller;