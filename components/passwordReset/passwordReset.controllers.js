const async = require("async")
const crypto = require("crypto")
const User = require('../users/models/user')
const controller = {}

controller.passwordReset = (req,res) => {
    res.render('views/spanish/login/passwordReset/passwordReset', {
      messageReset : req.flash('resetMessage')
    })
}

controller.passwordResetPost = (req,res) => {
  async.waterfall([
    function(done){
      crypto.randomBytes(20, function(err, buf){
        var token = buf.toString('hex');
        done(err, token)
      })
    },

    function(token, done){
      User.findOne({username : req.body.username}, function(err, user){
        if(!user){
          req.flash('resetMessage', 'Email incorrecto')
          return res.redirect('/Dintair/passwordReset/new');
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;

        user.save(function(err){
          done(err, token, user)
        })
      })
    },
    function(token, user, done){
      //Para mailgun
      const content = ''
      var api_key = process.env.MAILGUN_APIKEY;
      var domain = process.env.MAILGUN_DOMAIN;
      var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
       
      var data = {
        from: 'Dintair <Noreply@dintair.com>',
        to: req.body.username,
        subject: 'Restauración de contraseña',
        //text: 'Bienvenido a Everest',
        //html: 'Bienvenido a Everest '+ newUser.comp_name
        //html: fs.readFileSync('src/views/espanol/foremails/pass_reset.html', 'utf-8')
        // '<a href="https://' + req.headers.host + '/Dintair/passwordReset/new/procedure/' + token + '\n\n">'+
        //   '<button style="width: 250px; padding:5px; background: #1a75ff; border-radius: 4px; color: white; border: 1px solid #1a75ff; outline: none;"> Restaurar mi contraseña </button>'+
        // '</a>'+

        // '<a href="https://www.dintair.com/Dintair/passwordReset/new/procedure/' + token + '\n\n">'+
        //   '<button style="width: 250px; padding:5px; background: #1a75ff; border-radius: 4px; color: white; border: 1px solid #1a75ff; outline: none;"> Restaurar mi contraseña </button>'+
        // '</a>'+
        
        html: '<body style="margin: 0px; padding: 0px; background: hsl(0, 0%, 99%); padding: 0px; text-align: center;"">'+
                '<div style="text-align: center; width: 100%; margin: 0 auto; max-width: 600px; background: white; padding: 5px; border-bottom: 1px solid #e6e6e6;">'+
                  '<div style="text-align: center; margin-top: 10px; margin-bottom: 10px; margin: 0 auto;">'+
                    '<img style="width: 65px;" src="https://res.cloudinary.com/drdmb9g49/image/upload/v1539535590/Dintair%20images/dintair_iso.png">'+
                  '</div>'+

                  '<div style="padding-left: 5px; padding-right: 5px; padding-bottom: 10px; margin-top: 20px; border-bottom: 1px solid #e6e6e6;">'+
                    '<p style="font-size: 15px; color: #0086b3; font-weight: bold; text-align: left; letter-spacing: 0.2px; margin: 0 0 0px; margin-bottom: 20px;"> Hola, </p>'+
                    '<p style="font-size: 15px; color: #737373; text-align: left; letter-spacing: 0.2px; margin: 0 0 0px; margin-bottom: 20px;">Ha recibido este email por que solicitó resturar su contraseña. Si no hiso esta solicitud, por favor, ignore este mensaje.</p>'+

                    '<p style="font-size: 15px; color: #737373; text-align: left; letter-spacing: 0.2px; margin: 0 0 0px; margin-bottom: 20px;">Continue con el proceso dando clic en "Restaurar mi contraseña".</p>'+

                    '<a href="http://' + req.headers.host + '/Dintair/passwordReset/new/procedure/' + token + '\n\n">'+
                     '<button style="width: 250px; padding:5px; background: #1a75ff; border-radius: 4px; color: white; border: 1px solid #1a75ff; outline: none;"> Restaurar mi contraseña </button>'+
                   '</a>'+
                  
                  '</div>'+
                
                
                  '<div style="margin-bottom:20px; margin-top:20px; padding-left: 5px; padding-right: 5px;">'+

                    '<h4 style="margin: 0 0 0px; text-align: left; color: #737373; letter-spacing: 0.2px; padding-top: 0px"> Muchas gracias, </h4>'+

                    '<h4 style="margin: 0 0 0px; text-align: left; color: #737373; letter-spacing: 0.2px; padding-top: 10px;"> El equipo de Dintair </h4>'+

                  '</div>'+


                  '<div style="text-align: center; margin: 0 auto; width: 100%; padding: 5px;>'+

                    '<ul style="margin: 0 0 0px;">'+
                      '<li class="inline" style="margin: 0 0 0px; padding-right: 5px; list-style: none; display: inline-block;">'+
                        '<a class="terms" href="https://www.dintair.com/Dintair/privacyPolice">'+
                          '<p style="margin: 0 0 0px; color: #1a75ff;">Política de privacidad</p>'+
                        '</a>'+
                      '</li>'+

                      '<li class="inline" style="margin: 0 0 0px; padding-left: 5px; list-style: none; display: inline-block;">'+
                        '<a class="terms" href="https://www.dintair.com/Dintair/termsOfUse">'+
                          '<p style="margin: 0 0 0px; color: #1a75ff;">Condiciones de uso</p>'+
                        '</a>'+
                      '</li>'+
                    '</ul>'+
                  '</div>'+

                  '<h4 style="color: #737373; font-size: 12px; letter-spacing: 0.2px;"> © Copyright 2018, Dintair all rights reserved </h4>'+
                  '<h4 style="color: #737373; font-size: 10px; letter-spacing: 0.2px;"> Av. El Derby 575, Santiago de Surco, Lima, Perú </h4>'+
                '</div>'+
                '<div style="margin: 0 auto; text-align: center;">'+
                  '<h4 style="color: #737373; font-size: 10px; letter-spacing: 0.2px;"> Este mensaje se envió a '+
                    '<strong style="color: #33adff; font-size: 10px;">'+user.username+'</strong>'+
                  '.</h4>'+
                '</div>'+
              '</body>'

        
      };

      /*'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://' + req.headers.host + '/Everest/passwordReset/new/procedure/' + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n'*/
       
      mailgun.messages().send(data, function (error, body) {
        if(error){
          console.log(error)
        }
          console.log(body);
      });
      //Fin d epara mailgun
      return done(null, false, req.flash('resetMessage', 'Hemos enviado un email a '+ user.username+' con los pasos para que pueda restaurar su contraseña.'))
    }

  ], function(err){
    if(err) return next(err)
      res.redirect('/Dintair/passwordReset')
  })
}

controller.passwordResetView = (req,res) => {
  res.render('views/spanish/login/passwordReset/afterSend', {
    messageReset : req.flash('resetMessage')
  })
}

controller.passwordResetToken = (req,res) => {
  User.findOne({resetPasswordToken : req.params.token, resetPasswordExpires : {$gt: Date.now()}}, function(err, user){
    if(!user){
      req.flash('error', 'La contraseña es invalida o ha expirado')
      return res.redirect('/Dintair/passwordReset/new')
    }
    res.render('views/spanish/login/passwordReset/passwordResetCheck', {
      token: req.params.token,
      message : req.flash('error'),
    })
  })
}

controller.passwordResetTokenPut = (req,res) => {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("errorr", "Las contraseñas no coinciden");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      //Para mailgun
      const content = ''
      var api_key = process.env.MAILGUN_APIKEY;
      var domain = process.env.MAILGUN_DOMAIN;
      var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
       
      var data = {
        from: 'Dintair <Noreply@dintair.com>',
        to: user.username,
        subject: 'Restauración de contraseña',
        //text: 'Bienvenido a Everest',
        //html: 'Bienvenido a Everest '+ newUser.comp_name
        //html: fs.readFileSync('src/views/espanol/foremails/pass_reset.html', 'utf-8')
        html: '<body style="margin: 0px; padding: 0px; background: hsl(0, 0%, 99%); padding: 0px; text-align: center;"">'+
                '<div style="text-align: center; width: 100%; margin: 0 auto; max-width: 600px; background: white; padding: 5px; border-bottom: 1px solid #e6e6e6;">'+
                  '<div style="text-align: center; margin-top: 10px; margin-bottom: 10px; margin: 0 auto;">'+
                    '<img style="width: 65px;" src="https://res.cloudinary.com/drdmb9g49/image/upload/v1539535590/Dintair%20images/dintair_iso.png">'+
                  '</div>'+

                  '<div style="padding-left: 5px; padding-right: 5px; padding-bottom: 10px; margin-top: 20px; border-bottom: 1px solid #e6e6e6;">'+
                    '<p style="font-size: 15px; color: #0086b3; font-weight: bold; text-align: left; letter-spacing: 0.2px; margin: 0 0 0px; margin-bottom: 20px;"> Hola,</p>'+
                    '<p style="font-size: 15px; color: #737373; text-align: left; letter-spacing: 0.2px; margin: 0 0 0px; margin-bottom: 20px;">Su contraseña ha sido restaurada exitosamente.</p>'+
                    
                  '</div>'+
                
                
                  '<div style="margin-bottom:20px; margin-top:15px; padding-left: 5px; padding-right: 5px;">'+

                    '<h4 style="margin: 0 0 0px; text-align: left; color: #737373; letter-spacing: 0.2px; padding-top: 0px"> Muchas gracias, </h4>'+

                    '<h4 style="margin: 0 0 0px; text-align: left; color: #737373; letter-spacing: 0.2px; padding-top: 10px;"> El equipo de Dintair</h4>'+

                  '</div>'+



                  '<h4 style="color: #737373; font-size: 12px; letter-spacing: 0.2px;"> © Copyright 2018, Dintair all rights reserved </h4>'+
                  '<h4 style="color: #737373; font-size: 10px; letter-spacing: 0.2px;"> Av. El Derby 575, Santiago de Surco, Lima, Perú </h4>'+

                  
                '</div>'+
                '<div style="margin: 0 auto; text-align: center;">'+
                  '<h4 style="color: #737373; font-size: 10px; letter-spacing: 0.2px;"> Este mensaje se envió a '+
                    '<strong style="color: #33adff; font-size: 10px;">'+user.username+'</strong>'+
                  '.</h4>'+
                '</div>'+
              '</body>'
        
      };
       
      mailgun.messages().send(data, function (error, body) {
        if(error){
          console.log(error)
        }
          console.log(body);
      });
      //Fin de para mailgun
      return done(null, false, req.flash('ConfirmMessage', '¡Este es el último paso! Por favor, ingrese nuevamente su contraseña.'))
    }
  ], function(err) {
    res.redirect('/Dintair/profile/resetPassword/:id');
  });
}

module.exports = controller;