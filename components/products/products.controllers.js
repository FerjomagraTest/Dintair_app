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

controller.viewMyProductDetail = (req,res) => {

    var id_producto = req.params.id
    var token = req.params.token

    Products.findById({'_id': id_producto}, function(err,productos){
        if(err){
            res.redirect('/Dintair/messages')
            return
        }
        var files = '';

        if(productos.imgProductos != '' ){
            files = productos.imgProductos.split('---');

            console.log('mostrando array de files------>');
            console.log(files);
        }

        productos.files = files;

        res.render('views/spanish/products/viewProductUser', {
            productos_user: productos, 
            user : req.user
        })
        
    })
    
}

controller.productsEditView = (req,res) => {
    var id_producto = req.params.id
    
    Products.findById({'_id': id_producto}, function(err, producto){

        var files = '';

        if(producto.imgProductos != '' ){
            files = producto.imgProductos.split('---');
        }

        producto.files = files;

        res.render('views/spanish/products/editProdUser', {
            productos_user: producto, 
            user : req.user
        })
    })
}

controller.editProductPost = (req,res) => {
    res.setHeader('Content-Type', 'application/json');

    var data_products = {
        nombre : req.body.nombre,
        targetsell: req.body.targetsell,
        descripcion : req.body.descripcion,
        procedencia : req.body.procedencia,
        tipo_unidades : req.body.tipo_unidades,
        stock : req.body.stock,
        peso : req.body.peso,
        medida : req.body.medida,
        moneda: req.body.moneda,
        precio : req.body.precio,
        precio_min : req.body.precio_min,
        cantidad_min : req.body.cantidad_min,
        tipo_unidades_min : req.body.tipo_unidades_min,
        color : req.body.color,
        dimensiones : req.body.dimensiones,
        material : req.body.material,
        imgProductos: req.body.fileOld
    };

    var result = {state : 0, msg : 'No se pudo registrar'};
    var files = JSON.parse(req.body.files);

    if(files.length){
        Products.findByIdAndUpdate({'_id': req.params.id}, data_products, function(productos){
            result = {
                state : 1,
                msg : 'ok datos',
                data: {url: '/Dintair/kindProduct'}
            };
        })

        function saveData(newRoute){
            data_products.imgProductos = newRoute;

            Products.findByIdAndUpdate({'_id': req.params.id}, data_products, function(err){
                if(!err){
                    req.flash('messageprod' , 'Producto ' + data_products.nombre + ' modificado')

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
        Products.findByIdAndUpdate({'_id': req.params.id}, data_products, function(err){
            if(!err){
                req.flash('messageprod' , 'Producto ' + data_products.nombre + ' modificado')

                result = {
                    state : 1,
                    msg : 'ok',
                    data: {url: '/Dintair/kindProduct'}
                };
            } else {
                result = {state : 0, msg : 'No se pudo modificar los cambios, intentelo mas tarde'};
            }

            res.send(JSON.stringify(result));
        })
    }
}

controller.deleteProduct = (req,res) => {
    var id_producto = req.params.id

    var username = req.params.username

    var meses = new Array('Enero', "Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto",
        "Septiembre","Octubre","Noviembre","Diciembre")
    var fechaactual = new Date()
    var tiempoact= (fechaactual.getDate() + ' de ' + meses[fechaactual.getMonth()] + ' de ' + fechaactual.getFullYear())
    //Formato fecha
    var am_pm_var = ""

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

    var data_products = {
        deleted : true,
        deleteDate : tiempoact,
        deleteTime : nuevafecha
    }

    Products.findByIdAndUpdate({'_id': id_producto}, data_products,function(err){
        if(!err){
        res.redirect('/Dintair/kindProduct')
        return
        } else {
        console.log(err)
        res.redirect('/Dintair')
        }
    })
}

controller.viewAnotherProduct = (req,res) => {

    var id_producto = req.params.id
    var token = req.params.token

    Products.findById({'_id':id_producto}).populate('creator').exec(
        function(err,productos){
        var files = '';

        if(productos.imgProductos != '' ){
            files = productos.imgProductos.split('---');

            console.log('mostrando array de files------>');
            console.log(files);
        }

        productos.files = files;

        res.render('views/spanish/products/viewOtherProduct', {
            productos_user: productos, 
            user : req.user
        })
        }  
    )
}

module.exports = controller;