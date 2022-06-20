const Products = require('./models/products');
const Servicios = require('../services/models/services');
const UploadTavo = require('../../middleware/uploadImages/upload')
const fs = require('fs')
const controller = {}

var cloudinary_users = require('cloudinary')
cloudinary_users.config({
  cloud_name: process.env.CLOUDINARY_USERSNAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET
})


controller.productsIndexView = (req,res) => {
    res.render('views/spanish/products/indexView', {
        message : req.flash('messagesend'),
        messageReset : req.flash('resetMessage')
    })
}

//start of user Interface
controller.createProductViews = (req,res) => {
    res.render('views/spanish/products/createProductView', {
        user: req.user
    })
}

controller.kindProduct = (req,res) => {
    Products.find({creator : req.user._id}).populate('creator').exec(
        function(err, myproducts){
          if(err){
            res.redirect('/Dintair')
            return
          }
          //Falta implementar servicios
          Servicios.find({creator : req.user._id}).populate('creator').exec(
            function(err, myServices){
              if(err){
                res.redirect('/Dintair')
                return
              }
              res.render('views/spanish/products/principalPage', {
                user: req.user,
                myproducts : myproducts.reverse(),
                myServices : myServices.reverse()
              })
            }
          )
        }
    )
}


controller.createProductPost = (req,res) => {
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

    var data_products = {
        nombre : req.body.nombre,
        targetsell: req.body.targetsell,
        descripcion : req.body.descripcion,
        procedencia : req.body.procedencia,
        stock : req.body.stock,
        tipo_unidades : req.body.tipo_unidades,
        peso : req.body.peso,
        medida : req.body.medida,
        precio : req.body.precio,
        precio_min : req.body.precio_min,
        cantidad_min : req.body.cantidad_min,
        moneda: req.body.moneda,
        color : req.body.color,
        dimensiones : req.body.dimensiones,
        material : req.body.material,
        fecha: tiempoact,
        horaact: horaactual,
        nuevafecha : nuevafecha,
        creator: req.body.id,
        imgProductos : '/images/restrictedProducts/defaultImage.jpg',
        deleted : false
    }

    var productos_user = new Products(data_products);
    var result = {state : 0, msg : 'No se pudo registrar'};
    var files = JSON.parse(req.body.files);

    if(files.length){
        function saveData(newRoute){
            productos_user.imgProductos = newRoute;
            productos_user.save(function(err){
                if(!err){
                    req.flash('messageprod' , 'Producto ' + productos_user.nombre + ' creado')

                    result = {
                        state : 1,
                        msg : 'ok',
                        data: {url: '/Dintair/kindProduct'}
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
        productos_user.save(function(err){
            if(!err){
                req.flash('messageprod' , 'Producto ' + productos_user.nombre + ' creado')

                result = {
                    state : 1,
                    msg : 'ok',
                    data: {url: '/Dintair/kindProduct'}
                };
            } else {
                result = {state : 0, msg : 'No se pudo registrar los cambios, intentelo mas tarde'};
            }

            res.send(JSON.stringify(result));
        })
    }
}

module.exports = controller;