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

module.exports = controller;