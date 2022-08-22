const controller = {}

const Restricted_products = require('./models/restricted_products')

const UploadTavo = require('../../middleware/uploadImages/upload')

const fs = require('fs')

var cloudinary_users = require('cloudinary')
cloudinary_users.config({
  cloud_name: process.env.CLOUDINARY_USERSNAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET
})

controller.restrictedProducts = (req,res) => {
    Restricted_products.find({}).exec((err, aeroproductos)=>{
        if(err){
          res.redirect('/')
          return
        }
        //console.log(`Datos: ${aeroproductos}`)
        res.render('views/spanish/restrictedProducts/index', {
          aeroproductos : aeroproductos,
          message : req.flash('messagesend'),
          messageReset : req.flash('resetMessage')
        })
    });
}

controller.productListIndex = (req,res) => {
    console.log("antes del setheader")
    res.setHeader('Content-Type', 'application/json');
    var text = req.body.search;
    console.log('nombre: '+text)
    //productos
    var filter = {
      'nombre' : new RegExp(text, "i"),
      'deleted': false
    }; // ----> /value/i

    console.log('data filter: '+filter);

    Restricted_products.find(filter).limit(10).exec( function(err, docProduct){
      console.log('data: ' + docProduct)
        if(docProduct){
            var result = {
              state: 1,
              msg: 'ok!',
              data: docProduct
            }
            console.log(docProduct);

            res.send(JSON.stringify(result));
            
        } else {
          var result = {
            state: 0,
            msg: 'No se pudo traer los productos!',
            data: {}
          }

          //res.send(JSON.stringify(result));
        }
    })
} 

controller.productListId = (req,res) => {
  
  var id_restrict = req.params.id
  Restricted_products.findById({'_id':id_restrict}, function(err, aeroprods){
    res.render('views/spanish/restrictedProducts/product_id',{
      restricted_product : aeroprods,
      user: req.user
    })
    
  })
 
}

controller.productForm = (req,res) => {
    res.render('views/spanish/restrictedProducts/importUserInterface/productForm', {
        user: req.user,
        messageprod : req.flash('messageprod')
    })
}

controller.productFormPost = (req,res) => {
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

    var data_restricted = {
        nombre : req.body.nombre,
        iam : req.body.iam,
        link : req.body.link,
        aeropost_link : req.body.aeropost_link,
        entidad : req.body.entidad,
        documents : req.body.documents,

        tupa_permiso : req.body.tupa_permiso,
        precio_permiso : req.body.precio_permiso,
        url_tramite : req.body.url_tramite,

        subpartida : req.body.subpartida,
        comentario : req.body.comentario,

        fecha: tiempoact,
        horaact: horaactual,
        nuevafecha : nuevafecha,
        creator: req.body.id,
        imgProductos : '/images/img_defectproducts_none-01.jpg',
        deleted : false
    }

    var restricted_product = new Restricted_products(data_restricted);
    var result = {state : 0, msg : 'No se pudo registrar'};
    var files = JSON.parse(req.body.files);

     if(files.length){
         function saveData(newRoute){
             restricted_product.imgProductos = newRoute;
             restricted_product.save(function(err){
                 if(!err){
                     req.flash('messageprod' , 'Producto ' + restricted_product.iam + ', creado')

                     result = {
                         state : 1,
                         msg : 'ok',
                         data: {url: '/Dintair/imports/addProduct'}
                     };
                 } else {
                     result = {state : 0, msg : 'No se registrar los cambios'};
                 }

                 res.send(JSON.stringify(result));
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
      restricted_product.save(function(err){
          if(!err){
              req.flash('messageprod' , 'Producto ' + restricted_product.iam + ', creado')

              result = {
                  state : 1,
                  msg : 'ok',
                  data: {url: '/Dintair/imports/addProduct'}
              };
          } else {
              result = {state : 0, msg : 'No se pudieron registrar los cambios, intentelo mas tarde'};
          }

          res.send(JSON.stringify(result));
      })
    }
}

controller.restrictedProductsList = (req,res) => {
    res.render('views/spanish/restrictedProducts/importUserInterface/viewResults',{
        user: req.user
    })
}

controller.searchRestrictedProduct = (req,res) => {
    res.setHeader('Content-Type', 'application/json');

      //productos
      
      var filter = {
        'nombre' : new RegExp(req.body.search, "i"),
        'deleted': false
      }; // ----> /value/i

      console.log(filter);

      Restricted_products.find(filter).limit(10).exec( function(err, docProduct){
          if(docProduct){
              var result = {
                  state: 1,
                  msg: 'ok!',
                  data: docProduct
              }

              console.log(docProduct);

              res.send(JSON.stringify(result));
          } else {
              var result = {
                  state: 0,
                  msg: 'No se pudo traer los productos!',
                  data: {}
              }

              res.send(JSON.stringify(result));
          }
      })
}

controller.viewRestrictedProduct = (req,res) => {
    var id_restrict = req.params.id
    Restricted_products.findById({'_id':id_restrict}, function(err, aeroprods){
      var files = '';

      if(aeroprods.imgProductos != '' ){
          files = aeroprods.imgProductos.split('---');

          console.log('mostrando array de files------>');
          console.log(files);
      }

      aeroprods.files = files;

      res.render('views/spanish/restrictedProducts/importUserInterface/editRestrictedProduct',{
        restricted_product : aeroprods,
        user: req.user
      })
    })
}

controller.editRestrictedProductPut = (req,res) => {
    res.setHeader('Content-Type', 'application/json');

    var meses = new Array('Enero', "Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
    var fechaactual = new Date()

    var data_restricted = {
        nombre : req.body.nombre,
        iam : req.body.iam,
        link : req.body.link,
        aeropost_link : req.body.aeropost_link,
        entidad : req.body.entidad,
        documents : req.body.documents,
        subpartida : req.body.subpartida,
        comentario : req.body.comentario,
        tupa_permiso : req.body.tupa_permiso,
        precio_permiso : req.body.precio_permiso,
        url_tramite : req.body.url_tramite
    }

    var result = {state : 0, msg : 'No se pudo registrar'};
    var files = JSON.parse(req.body.files);

    if(files.length){
      Restricted_products.update({'_id': req.params.id}, data_restricted, function(aeropostProducts){
        result = {
          state : 1,
          msg : 'ok datos',
          data: {url: '/Dintair'}
        };
      })

      function saveData(newRoute){
          data_restricted.imgProductos = newRoute;

          Restricted_products.update({'_id': req.params.id}, data_restricted, function(err){
            if(!err){
                result = {
                    state : 1,
                    msg : 'ok',
                    data: {url: '/Dintair/myrecords'}
                };
            } else {
                result = {state : 0, msg : 'No se registraron los cambios'};
            }

            res.send(JSON.stringify(result));
          });
      }

      var count = files.length;
      var index = 0;
      var newRoute = '';

      files.map((item) => {
        var newFile = UploadTavo()._getFile(item);
        var nameFile = UploadTavo()._getRandom(5) + '-' + req.params.id + '.' + newFile.type;
        var routeFile = './uploads/' + nameFile;

        fs.writeFile(routeFile, newFile.data, {encoding: 'base64'}, function(err) {
            if (err) {
                console.log('err', err);
            } else {
                cloudinary_users.uploader.upload(routeFile, function(result) {
                    newRoute = (newRoute)? newRoute + '---' + result.url : result.url;

                    index++;
                    if(index == count){
                        newRoute = (req.body.fileOld)? req.body.fileOld + '---' + newRoute : newRoute;
                        saveData(newRoute);
                    }
                })
            }
        });
      });
    } else {
      Restricted_products.update({'_id': req.params.id}, data_restricted, function(err){
          if(!err){
            result = {
                state : 1,
                msg : 'ok',
                data: {url: '/Dintair/myrecords'}
            };
          } else {
              result = {state : 0, msg : 'No se pudo modificar los cambios, intentelo mas tarde'};
          }

          res.send(JSON.stringify(result));
      })
    }
}

module.exports = controller;