const controller = {}
const Publications = require('../publication/models/publications')
const Ambassador = require('../ambassador/models/ambassador')
const Products = require('../products/models/products')
const Servicios = require('../services/models/services')
const UserContact = require('./models/user_contact')
const Sugerencias = require('../suggestions/models/suggest')
const PublicationRecommended = require('../publication/models/publication_recommended')
const User = require('./models/user')
const UserMap = require('./models/user_map')
const mongoose = require('mongoose')
const fs = require('fs')
const async = require("async")
const bcrypt = require('bcrypt-nodejs')

const UploadTavo = require('./resources/upload')

var cloudinary_users = require('cloudinary')
cloudinary_users.config({
  cloud_name: process.env.CLOUDINARY_USERSNAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET
})

controller.userProfileView = (req,res) => {

    function _like (data, userId){
        var filterLike = {user_id: req.user._id}

        PublicationRecommendedLike.find(filterLike).exec(function(errLike, docLike){
            var countLike = docLike.length;
            var postId = [];

            if(countLike > 0){
                var indexLike = 1;

                docLike.map(function(itemLike){
                    postId.push(itemLike.publication_id.toString());

                    if(indexLike == countLike){
                        data.myLike = postId;

                        _publication(data, userId);
                    }

                    indexLike++;
                });
            } else {
                _publication(data, userId);
            }
        });
    }
    
    Publications.find({creator: req.user._id}).populate('creator').exec(
        function(err, publics){
        if(err){
            res.redirect('/Dintair')
            return
        }
        Ambassador.find({creator : req.user._id}).populate('creator').exec(
            function(err, ambassador){
            if(err){
                res.redirect('/Dintair')
                return
            }
            Products.find({creator : req.user._id}).populate('creator').exec(
                function(err, myproducts){
                if(err){
                    res.redirect('/Dintair/spaceS/:page/pages')
                    return
                }
                Servicios.find({creator : req.user._id}).populate('creator').exec(
                    function(err, myServices){
                    if(err){
                        res.redirect('/Dintair/spaceS/:page/pages')
                        return
                    }
                    UserContact.find({user_contact_id : req.user._id}).populate('user_id').exec(
                        function(err, followers){
                        if(err){
                            res.redirect('/Dintair')
                            return
                        }
                        UserContact.count({user_contact_id:req.user._id}).populate('user_contact_id').exec(
                            function(err, followers_count){
                            if(err){
                                res.redirect('/Dintair')
                                return
                            }
                            Sugerencias.find({}, function(err, sugerencias){
                                if(err){
                                res.redirect('/Dintair')
                                return
                                }
                                PublicationRecommended.find({creator: req.user._id}).populate('creator').exec(function(err, publications){
                                if(err){
                                    res.redirect('/Dintair')
                                    return
                                }

                                var dataFinal = {
                                    user : req.user,
                                    publics : publics.reverse(),
                                    successPass : req.flash('successPass'),
                                    deletePublic : req.flash('deletePublic'),
                                    ambassador : ambassador,
                                    myproducts : myproducts.reverse(),
                                    myServices : myServices.reverse(),
                                    followers : followers,
                                    followers_count : followers_count,
                                    successedit: req.flash('success'),
                                    sucessamb: req.flash('successamb'),
                                    successUsername : req.flash('successUsername'),
                                    sugerencias:sugerencias.reverse(),
                                    myLike : [],
                                    publications:publications.reverse(),
                                    places: []
                                }

                                var filterUserMap = {user_id: mongoose.Types.ObjectId(req.user._id)};

                                UserMap.find(filterUserMap).exec(function(errUserMap, docUserMap){
                                    if(!errUserMap){
                                        if(docUserMap.length){
                                            var countUserMap  = docUserMap.length;
                                            var indexUserMap  = 1;
                                            var places        = [];

                                            docUserMap.map((itemUserMap) => {
                                                places.push({
                                                    lat:itemUserMap.lat,
                                                    lng:itemUserMap.lng,
                                                    title:itemUserMap.title,
                                                });

                                                if(indexUserMap == countUserMap){
                                                    dataFinal.places = places;

                                                    res.render('views/spanish/usersInterface/userProfileView', dataFinal);
                                                }

                                                indexUserMap++;
                                            });
                                        } else {
                                            res.render('views/spanish/usersInterface/userProfileView', dataFinal);
                                        }

                                    } else {
                                        res.render('views/spanish/usersInterface/userProfileView', dataFinal);
                                    }

                                });
                            })
                        })}
                    )}
                )}
            )}
        )}
    )}
)}

controller.otherUserProfile = (req,res) => {
    var iduser = req.params.id
    var id_user = req.user._id
    var perPage = 6

    User.findByIdAndUpdate(req.params.id, {$inc: {vistas:1}}, function(err, usuario){
      if(err){
        res.redirect('/Dintair/Search')
        return
      }
      Products.find({creator: iduser}).populate('creator').exec(
        function(err, allproducto){
          if(err){
            res.redirect('/Dintair/Search')
            return
          }
          Servicios.find({creator: iduser}).populate('creator').exec(

            function(err, allservices){
              if(err){
                res.redirect('/Dintair/Search')
                return
              }
              Ambassador.find({creator : iduser}).populate('creator').exec(
                function(err, Ambuser){
                  if(err){
                    res.redirect('/Dintair/Search')
                    return
                  }
                  UserContact.find({user_contact_id : iduser}).populate('user_id').exec(
                    function(err, followers){
                      if(err){
                        res.redirect('/Dintair')
                        return
                      }
                      UserContact.count({user_contact_id:iduser}).populate('user_contact_id').exec(
                        function(err, followers_count){
                          if(err){
                            res.redirect('/Dintair')
                            return
                          }

                          var filterContact = {user_id:id_user, user_contact_id: mongoose.Types.ObjectId(iduser)};

                          UserContact.find(filterContact).exec(function(errContact, docContact){
                            var following = (docContact.length)?  1 : 0 ;

                            var dataFinal = {
                                user: req.user,
                                newUser: usuario,
                                allproducto: allproducto.reverse(),
                                allservices : allservices,
                                Ambuser : Ambuser,
                                following : following,
                                followers_count : followers_count,
                                followers : followers,
                                places: []
                            }

                            var filterUserMap = {user_id: mongoose.Types.ObjectId(iduser)};

                            UserMap.find(filterUserMap).exec(function(errUserMap, docUserMap){
                                if(!errUserMap){
                                    if(docUserMap.length){
                                        var countUserMap  = docUserMap.length;
                                        var indexUserMap  = 1;
                                        var places        = [];

                                        docUserMap.map((itemUserMap) => {
                                            places.push({
                                                lat:itemUserMap.lat,
                                                lng:itemUserMap.lng,
                                                title:itemUserMap.title,
                                            });

                                            if(indexUserMap == countUserMap){
                                                dataFinal.places = places;

                                                res.render('views/spanish/usersInterface/userOtherProfile', dataFinal);
                                            }

                                            indexUserMap++;
                                        });
                                    } else {
                                        res.render('views/spanish/usersInterface/userOtherProfile', dataFinal);
                                    }

                                } else {
                                    res.render('views/spanish/usersInterface/userOtherProfile', dataFinal);
                                }

                            });

                          });
                        }
                      )
                    }
                  )
                }
              ) 
            }    
          )
        }
      )
    })
}

controller.changePortrait = (req,res) => {
    
    var data_portada = {
        imagePortadaCrop: ''
    }

    const path = require('path')
    console.log(req.file)

    //EDITAR SIN IMAGEN Y CON IMAGEN
    if(req.file){

        cloudinary_users.uploader.upload(req.file.path,
            function(result){
                data_portada.imagePortada = result.url;
            }
        )

        //----inicio upload image
        if(req.body.imagePortadaCrop){
            var file = req.body.imagePortadaCrop;
            var newRoute = '';
            var newFile = UploadTavo()._getFile(file);
            var nameFile = UploadTavo()._getRandom(5) + '-' + req.params.id + '.' + newFile.type;
            var routeFile = './uploads/' + nameFile;

            fs.writeFile(routeFile, newFile.data, {encoding: 'base64'}, function(err) {
                if (err) {
                    console.log('err', err);
                } else {
                    //subiendo al servidor
                    cloudinary_users.uploader.upload(routeFile, function(result) {
                        data_portada.imagePortada = result.url

                        User.findByIdAndUpdate({'_id': req.params.id}, data_portada, function(usuarios){
                            res.redirect('back')
                        })
                    })
                }
            });
        } else {
            User.findByIdAndUpdate({'_id': req.params.id}, data_portada, function(usuarios){
                res.redirect('back')
            })
        }
        //----fin upload image
        
    } else {
        
        User.findByIdAndUpdate({'_id': req.params.id}, data_portada, function(usuarios){
        res.redirect('back')
        })     
    }
}

controller.changeLogo = (req,res) => {
    var data_user = {
        
    }
    const path = require('path')

    console.log(req.file)

    //EDITAR SIN IMAGEN Y CON IMAGEN
    if(req.file){

        cloudinary_users.uploader.upload(req.file.path,
            function(result){
                data_user.imageProfile = result.url
                User.findByIdAndUpdate({'_id': req.params.id}, data_user, function(usuarios){
                res.redirect('/Dintair/profile/user')
                })
            }
        )
        
    } else {
        
        User.findByIdAndUpdate({'_id': req.params.id}, data_user, function(usuarios){
        res.redirect('/Dintair/profile/user')
        })  
    }
}

controller.changeMarketLocalPicture = (req,res) => {
    var data_user = {
        
    }
    const path = require('path')

    console.log(req.file)

    //EDITAR SIN IMAGEN Y CON IMAGEN
    if(req.file){

        cloudinary_users.uploader.upload(req.file.path,
            function(result){
                data_user.imageMarket = result.url
                User.findByIdAndUpdate({'_id': req.params.id}, data_user, function(usuarios){
                res.redirect('/Dintair/profile/user')
                })
            }
        )
        
    } else {
        
        User.findByIdAndUpdate({'_id': req.params.id}, data_user, function(usuarios){
            res.redirect('/Dintair/profile/user')
        })  
    }
}

controller.editProfileView = (req,res) => {
    var iduser = req.user._id
    
    User.findById({'_id': iduser}, function(err, usuario){
        res.render('views/spanish/usersInterface/userEditPageView', { 
        user : req.user
        })
    })
}

controller.editProfilePut = (req,res) => {
    var data_user = {
        //dato principal
        rubroTarget : req.body.rubroTarget,
        comp_dedicacion: req.body.comp_dedicacion,
        comp_name: req.body.comp_name,
        comp_inicios: req.body.comp_inicios,
        comp_mision: req.body.comp_mision,
        comp_vision: req.body.comp_vision,
        //country: req.body.country,
        skills_comp : req.body.skills_comp,
        cant_trabajadores_comp : req.body.cant_trabajadores_comp,
        //dato adicional
        face_page : req.body.face_page,
        urlFace : req.body.urlFace,
        pagina_web: req.body.pagina_web,
        sede: req.body.sede,
        direccion: req.body.direccion,
        iam : req.body.iam,
        //otros
        dia: req.body.dia,
        mes: req.body.mes,
        ano: req.body.ano,
        wtpnumber: req.body.wtpnumber
    }

    const path = require('path')

    console.log(req.file)

    //EDITAR SIN IMAGEN Y CON IMAGEN
    if(req.file){

        cloudinary_users.uploader.upload(req.file.path,
            function(result){
                data_user.imageProfile = result.url
                User.findByIdAndUpdate({'_id': req.params.id}, data_user, function(usuarios){
                req.flash('success', 'Sus datos se han editado correctamente')
                res.redirect('/Dintair/profile/user')
                })
            }
        )
        
    } else {
        
        User.findByIdAndUpdate({'_id': req.params.id}, data_user, function(usuarios){
            req.flash('success', 'Sus datos se han editado correctamente')
            res.redirect('/Dintair/profile/user')
        })
    }
}

controller.passwordResetView = (req,res) => {
    var idUser = req.params.id
  
    User.findById({'_id': idUser}, function(err, userPass){
      res.render('views/spanish/usersInterface/passwordReset', {
        user : req.user,
        messageError : req.flash('errorr'),
        messageReset : req.flash('ConfirmMessage')
        
      })
    })
}

controller.passwordResetPut = (req,res) => {
    
    var password = req.body.password

    var data_user = {
        password : bcrypt.hashSync(password)
    }

    if(req.body.password === req.body.confirm){
        User.findByIdAndUpdate({'_id': req.params.id}, data_user, function(usuarios){
            req.flash('successPass', 'Ha cambiado su contraseña correctamente')
            res.redirect('/Dintair/profile/user')
            console.log('Contraseña cambiada')
        })  
    } else {
        req.flash("errorr", "Las contraseñas no coinciden");
        return res.redirect('back');
    }
}

controller.updateEmailView = (req,res) => {
    var iduser = req.params.id

    User.findById({'_id': iduser}, function(err, usernameDintair){
      res.render('views/spanish/usersInterface/email/username_edit', { 
        user : req.user,
        resetMessage : req.flash('resetMessage')
      })
    })
}

controller.updateEmailPut = (req,res) => {
    async.waterfall([
      
        function(token, done){
  
          User.findOne({'username' : req.body.username}, function(err, user){
            if(user){
              req.flash('resetMessage', 'El correo electrónico ya esta en uso')
              return res.redirect('/Dintair/username/updating');
            }
  
            else{
              var data_user = {
                username: req.body.username
              }
  
              const path = require('path')
                  
              User.findByIdAndUpdate({'_id': req.params.id}, data_user, function(usuarios){
  
                //Para mailgun
                const content = ''
                var api_key = process.env.MAILGUN_APIKEY;
                var domain = process.env.MAILGUN_DOMAIN;
                var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
                 
                var data = {
                  from: 'Dintair <notifications@dintair.com>',
                  to: data_user.username,
                  subject: 'Cambio de correo electrónico',
                  //text: suggests.comp_name+' te ha enviado una sugerencia.',
                  html: '<body style="margin: 0px; padding: 0px; padding: 0px; text-align: center;">'+
  
  
                          '<div style="text-align: center; width: 100%; margin: 0 auto; max-width: 600px; background-color: hsl(0, 0%, 98%); padding: 15px; border-bottom: 1px solid #e6e6e6;">'+
                            
                            '<img src="https://res.cloudinary.com/drdmb9g49/image/upload/v1539535844/Dintair%20images/dintair_isoName.png", style="width: 200px;">'+
  
                            '<p style="text-align: left; font-size: 16px; padding-top: 5px; padding-bottom: 2px; color: #404040"> Hola, </p>'+
                            '<p style="text-align: left; font-size: 16px; padding-top: 0px; padding-bottom: 2px; color: #404040">Ha cambiado su correo electrónico exitosamente. Desde ahora podrá ingresar a su cuenta de Dintair con: '+ 
                              '<strong style="color: #33adff; font-size: 16px;">'+data_user.username+'</strong>'+ 
                            '.</p>'+
  
  
                            '<div style="margin-bottom:20px; margin-top:20px; padding-left: 5px; padding-right: 5px;">'+
  
                              '<h4 style="margin: 0 0 0px; text-align: left; color: #737373; letter-spacing: 0.2px; padding-top: 0px"> Muchas gracias, </h4>'+
  
                              '<h4 style="margin: 0 0 0px; text-align: left; color: #737373; letter-spacing: 0.2px; padding-top: 10px;">El equipo de Dintair</h4>'+
  
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
                          '</div>'+
  
                          '<div style="margin: 0 auto; text-align: center;">'+
                            '<h4 style="color: #737373; font-size: 10px; letter-spacing: 0.2px;"> Este mensaje se envió a '+
                              '<strong style="color: #33adff; font-size: 10px;">'+data_user.username+'</strong>'+
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
                //Fin d epara mailgun
  
                req.flash('successUsername', 'Ha establecido su nuevo correo electrónico exitosamente.')
                res.redirect('/Dintair/profile/user')
              })
            }
          })
        }
    ])
}

controller.deleteAccountProcedure = (req,res) => {
    res.render('views/spanish/usersInterface/deleteAccount/deleteAccount', {
        user: req.user
    })
}

controller.deleteAccountDeleteMethod = (req, res) => {
    var username = req.params.username 

    var meses = new Array('Enero', "Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto",
      "Septiembre","Octubre","Noviembre","Diciembre")
    var fechaactual = new Date()
    var tiempoact= (fechaactual.getDate() + ' de ' + meses[fechaactual.getMonth()] + ' de ' + fechaactual.getFullYear())
    //Formato fecha
    var am_pm_var = ""

    var fechaactual = new Date()

    var curr_hour = fechaactual.getHours()-5

    if(curr_hour < 12){
      am_pm_var = 'AM'
    }
    else{
      am_pm_var = 'PM'
    }
    if(curr_hour == 0){
      curr_hour = 12
    }
    if(curr_hour > 12){
      curr_hour = curr_hour - 12
    }

    var curr_min = fechaactual.getMinutes()
    var nuevafecha = (curr_hour + " : " + curr_min + " " + am_pm_var)

    var data_user = {
      username : username + '_DELETED' +nuevafecha,
      deleted : true,
      deletedDate : tiempoact,
      deletedTime : nuevafecha,
      deleteWhy : req.body.deleteWhy,
      deleteDescription : req.body.deleteDescription
    }

    console.log(data_user)

    //EDITAR SIN IMAGEN Y CON IMAGE

    User.findByIdAndUpdate({'_id': req.params.id}, data_user, function(usuarios){
        res.redirect('/Dintair/endAccount')
    })
}

controller.byeByeDintair = (err,res) => {
    res.render('views/spanish/usersInterface/deleteAccount/byeByeDintair')
}

controller.endAccount = (req,res) => {
    req.logout();
    res.redirect('/Dintair/see/you/later/dintair')
}

module.exports = controller;