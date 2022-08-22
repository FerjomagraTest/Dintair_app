const controller = {}

const Products = require('../products/models/products')
const Servicios = require('../services/models/services')
const PublicationRecommended = require('../publication/models/publication_recommended')
const UserRecommended = require('../users/models/user_recommended')
const UserRecommendedTemp = require('../users/models/user_recommended_temp')
const User = require('../users/models/user')
const recommendedEmail = require('./models/recommendationEmail')
const mongoose = require('mongoose')
const recommended = require('../../middleware/recommendation/recommendation.js')
const tool = require('../../middleware/recommendation/tool')
const fs = require('fs')
const UploadTavo = require('../../middleware/uploadImages/upload')

var cloudinary_users = require('cloudinary')
cloudinary_users.config({
  cloud_name: process.env.CLOUDINARY_USERSNAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET
})

controller.publicationIndex = (req,res) => {
    Products.find({creator : req.user._id}).populate('creator').exec(
        function(err, myproducts){
          if(err){
            res.redirect('/Dintair')
            return
          }
          Servicios.find({creator : req.user._id}).populate('creator').exec(
            function(err, myServices){
              if(err){
                res.redirect('/Dintair')
                return
              }
              res.render('views/spanish/publications/index', {
                user: req.user,
                myproducts : myproducts.reverse(),
                myServices : myServices.reverse()
              })
            }
          )
        }
    )
}

controller.lookingForCustomers = (req,res) => {
    var id_producto = req.params.id
    var token = req.params.token

    Products.findById(req.params.id, function(err,productos){ 
    
      var files = '';

      if(productos.imgProductos != '' ){
          files = productos.imgProductos.split('---');

          console.log('mostrando array de files------>');
          console.log(files);
      }

      productos.files = files;

      res.render('views/spanish/publications/showClients', {
        productos_user: productos, 
        user : req.user
      })
    })
}

controller.createPublicationView = (req,res) => {
    function _publication(recommended, ids){
        var data = {
            user: req.user,
            recommended : recommended,
            publications: []
        }

        console.log(data);

        var filter = {creator:{$in: ids}}

        PublicationRecommended.find(filter).populate('creator').exec(function(err, publications){
            if(!err){
                data.publications = publications.reverse();
            }

            res.render('views/spanish/publications/createPublication', data)
        });
    }

    var filter = {
        $or: [
            {user_id: req.user._id},
            {user_contact_id: mongoose.Types.ObjectId(req.user._id)},
        ]
    };

    UserRecommended.find(filter).populate('user_contact_id').exec(function(err, doc) {
        var userId = [];
        var recommended = [];

        userId.push(req.user._id.toString());

        var count = (doc.length > 0) ? parseInt(doc.length) - 1 : doc.length;

        if(count > 0){
            doc.map(function(item, index){
                userId.push(item.user_contact_id._id.toString());
                recommended.push({
                    _id: item.user_contact_id._id,
                    comp_name: item.user_contact_id.comp_name,
                    representative: item.user_contact_id.full_name + ' ' + item.user_contact_id.first_name,
                    imageProfile : item.user_contact_id.imageProfile
                });

                if(index == count){
                    _publication(recommended, userId);
                }
            });
        } else {
            _publication(recommended, userId);
        }
    });
}

controller.createPublicationPost = (req,res) => {
    res.setHeader('Content-Type', 'application/json');
      var meses = new Array('Enero', "Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
      var fechaactual = new Date()

      //Formato fecha
      var fechaactual = new Date()
      var curr_hour = fechaactual.getHours()-5
      var am_pm_var = (curr_hour < 12) ? 'AM' : 'PM';

      if(curr_hour == 0){
          curr_hour = 12;
      }

      if(curr_hour > 12){
          curr_hour = curr_hour - 12;
      }

      var curr_min = fechaactual.getMinutes();
      var nuevafecha = (curr_hour + " : " + curr_min + " " + am_pm_var);
      var horaactual = (fechaactual.getHours() + ' : ' + fechaactual.getMinutes() + ' : ' + fechaactual.getSeconds());
      var tiempoact= (fechaactual.getDate() + ' de ' + meses[fechaactual.getMonth()] + ' de ' + fechaactual.getFullYear());


      var gDate = new Date();

      //fecha
      var year = gDate.getFullYear();
      var month = gDate.getMonth()+1;
      var dt = gDate.getDate();

      if (dt < 10) {
          dt = '0' + dt;
      }
      if (month < 10) {
          month = '0' + month;
      }

      var _date = year+'-' + month + '-'+dt;

      var nh = gDate.getHours();
      var nm = gDate.getMinutes();
      var ns = gDate.getSeconds();

      if(nh < 10){
          nh = '0' + nh;
      }

      if(nm < 10){
          nm = '0' + nm;
      }

      if(ns < 10){
          ns = '0' + ns;
      }

      var createdAt = _date + ' ' + nh + ':' + nm + ':' + ns;


      var publication = {
          estemensaje: req.body.estemensaje,
          imagePublics: req.body.imagePublics,
          //publicTarget: req.body.publicTarget,
          urldintair: req.body.urldintair,
          urlfacebook: req.body.urlfacebook,
          urlinstagram: req.body.urlinstagram,
          urllinkedin: req.body.urllinkedin,
          creator : req.user._id,
          fecha: tiempoact,
          horaact: horaactual,
          nuevafecha : nuevafecha,
          created_at: createdAt
      }


      var boxpublications = new PublicationRecommended(publication);
      var result = {state : 0, msg : 'No se pudo registrar'};
      var files = JSON.parse(req.body.files);

      if(files.length){
          function saveData(newRoute){
              var result = {state : 0, msg : 'No se pudo registrar'};

              boxpublications.imagePublics = newRoute;
              boxpublications.save(function(err){
                  if(!err){
                      var filter = {user_id: req.user._id};

                      UserRecommendedTemp.find(filter).exec( function(err, doc){
                          var countDoc = (doc.length > 0)? parseInt(doc.length) - 1 : doc.length;

                          if(countDoc){
                              doc.map((item, index) => {
                                  var data = {
                                      user_id: req.user._id,
                                      user_contact_id: item.user_contact_id
                                  }

                                  UserRecommended.find(data).exec(function (errExists, docExists){
                                      if(!docExists.length){
                                          var Recommended = new UserRecommended(data)

                                          //mUserRecommended.save(function(err){
                                          Recommended.save(function(err){
                                              if(!err){
                                                  result = {
                                                      state : 1,
                                                      msg : 'ok',
                                                      data: {url: '/Dintair'}
                                                  };
                                              }
                                          });
                                      } else {
                                          result = {
                                              state : 1,
                                              msg : 'ok',
                                              data: {url: '/Dintair'}
                                          };
                                      }

                                      if(countDoc == index){
                                          return res.send(JSON.stringify(result));
                                      }
                                  });
                              });
                          } else {
                              result = {
                                  state : 1,
                                  msg : 'ok',
                                  data: {url: '/Dintair'}
                              };

                              return res.send(JSON.stringify(result));
                          }
                      })
                  } else {
                      result = {state : 0, msg : 'No se registrar los cambios'};

                      return res.send(JSON.stringify(result));
                  }
              });
          }

          var count = files.length;
          var index = 0;
          var newRoute = '';

          files.map((item) => {
              var newFile = UploadTavo()._getFile(item);
              var nameFile = UploadTavo()._getRandom(5) + '-' + req.body.id + '.' + newFile.type;
              var routeFile = './uploads/' + nameFile;

              fs.writeFile(routeFile, newFile.data, {encoding: 'base64'}, function(err) {
                  if (err) {
                      console.log('err', err);
                  } else {
                      cloudinary_users.uploader.upload(routeFile, function(result) {
                          newRoute = (newRoute)? newRoute + '---' + result.url : result.url;

                          index++;
                          if(index == count){
                              saveData(newRoute);
                          }
                      })
                  }
              });
          });
      } else {
          boxpublications.save(function(err){
              if(!err){

                  result = {
                      state : 1,
                      msg : 'ok',
                      data: {url: '/Dintair'}
                  };
              } else {
                  result = {state : 0, msg : 'No se pudo registrar los cambios, intentelo mas tarde'};
              }

              res.send(JSON.stringify(result));
          })
      }
}

controller.recommendationLoader = (req,res) => {
    res.setHeader('Content-Type', 'application/json');

      UserRecommendedTemp.remove({ user_id: req.user._id }, function(err) {
          if (!err) {
              console.log('se borro correctamente');
          } else {
              console.log('no se pudo borrar');
          }
      });

      //cantidad de lista
      var list = JSON.parse(req.body.list);

      if(list.length){
          list.map((item, index) => {
              var data = {
                  user_id: req.user._id,
                  user_contact_id: item
              }

              var mUserRecommendedTemp = new UserRecommendedTemp(data)

              mUserRecommendedTemp.save(function(err){
                  if(!err){
                      console.log('saved');
                  } else {
                      console.log('no grabó aquí');
                  }
              });
          });
      }

      var result = {
          state: 1,
          msg: 'Se guardaron los datos correctamente!',
          data: {url: '/Dintair'}
      }

      return res.send(JSON.stringify(result))
}

//EDICIÓN DE PUBLICACIÓN?

controller.dashboardServices = (req,res) => {
    Servicios.findById(req.params.id, function(err,servicios){
    
        var files = '';
  
        if(servicios.imageServicios != '' ){
            files = servicios.imageServicios.split('---');
  
            console.log('mostrando array de files------>');
            console.log(files);
        }
  
        servicios.files = files;
  
        res.render('views/spanish/publications/showClients', {
          data_serv: servicios,
          user : req.user
        })
      })
}

controller.searchingProductsRecommendations = (req,res) => {
    res.setHeader('Content-Type', 'application/json');

    var perpage = 12
    var page = req.params.page || 1    
    var filter = {'creator' : req.user._id, 'deleted': false};

    Products.find(filter).exec( function(err, docProduct){      
      if(docProduct){
        var count = docProduct.length;
        var index = 0;
        var _gItem = [];

        docProduct.map(function(gItem){
            var _recommended = recommended.getItem(gItem.targetsell);
            _gItem = _gItem.concat(_recommended);

            index++;

            if(index == count){
              _gItem = _gItem.filter(tool.onlyUnique)

              var filterUser = {'_id':{$nin:[req.user._id]}, 'rubroTarget' : _gItem, 'deleted': false};

              User.find(filterUser).skip((perpage * page) - perpage).limit(perpage).exec(  
                function(err, doc){
                  if(err){
                    var result = {
                      state: 0,
                      msg: 'No se pudo traer los usuarios!',
                      data: {}
                    }
          
                    res.send(JSON.stringify(result))
                  } else {
                    var result = {
                      state: 1,
                      msg: 'ok!',
                      data: doc
                    }
                
                    res.send(JSON.stringify(result))
                  }
                }
              )
            }
        })

      } else {
        var result = {
          state: 0,
          msg: 'No se pudo traer los usuarios!',
          data: {}
        }

        res.send(JSON.stringify(result))
      }
    })
}

controller.searchingServicesRecommendations = (req,res) => {
    res.setHeader('Content-Type', 'application/json');

    var perpage = 12
    var page = req.params.page || 1    
    var filter = {'creator' : req.user._id, 'deleted': false};

    Servicios.find(filter).exec( function(err, docServicios){      
      if(docServicios){
        var count = docServicios.length;
        var index = 0;
        var _gItem = [];

        docServicios.map(function(gItem){
            var _recommended = recommended.getItem(gItem.targetsell);
            _gItem = _gItem.concat(_recommended);

            index++;

            if(index == count){
              _gItem = _gItem.filter(tool.onlyUnique)

              var filterUser = {'_id':{$nin:[req.user._id]}, 'rubroTarget' : _gItem, 'deleted': false};

              User.find(filterUser).skip((perpage * page) - perpage).limit(perpage).exec(  
                function(err, doc){
                  if(err){
                    var result = {
                      state: 0,
                      msg: 'No se pudo traer los usuarios!',
                      data: {}
                    }
          
                    res.send(JSON.stringify(result))
                  } else {
                    var result = {
                      state: 1,
                      msg: 'ok!',
                      data: doc
                    }
                
                    res.send(JSON.stringify(result))
                  }
                }
              )
            }
        })

      } else {
        var result = {
          state: 0,
          msg: 'No se pudo traer los usuarios!',
          data: {}
        }

        res.send(JSON.stringify(result))
      }
    })
}

controller.emailListPost = (req,res) => {
    recommendedEmail.remove({ user_id: req.user._id }, function(err) {
        if (!err) {
          console.log('se borro correctamente');
        } else {
          console.log('no se pudo borrar');
        }
      });
      
      var data = {
        imageProfile : req.body.imageProfile,
        comp_name : req.body.comp_name,
        user_id: req.user._id,
        email : req.body.email,
        representative : req.body.representative
      }
  
      recommendedEmail.create(data, function (err, doc) {
        if(doc){
          var result = {
            state: 1,
            msg: 'Se guardaron los datos correctamente!',
            data: doc
          }
  
          res.send(JSON.stringify(result))
        } else {
          var result = {
            state: 0,
            msg: 'No se pudo traer los usuarios!',
            data: {}
          }
  
          res.send(JSON.stringify(result))
        }
  
      })
}

module.exports = controller;