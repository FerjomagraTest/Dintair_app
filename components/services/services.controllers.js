const Servicios = require('./models/services');
const UploadTavo = require('../../middleware/uploadImages/upload')
const fs = require('fs')
const controller = {}

var cloudinary_users = require('cloudinary')
cloudinary_users.config({
  cloud_name: process.env.CLOUDINARY_USERSNAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET
})

controller.createServiceViews = (req,res) => {
    res.render('views/spanish/services/createServiceView', {
        user: req.user
    })
}

controller.createServicePost = (req,res) => {
    res.setHeader('Content-Type', 'application/json');

    var iduser = req.body.id
    //Formato fecha
    var am_pm_var = ""
    var fechaactual = new Date()
    var curr_hour = fechaactual.getHours()-5

    if(curr_hour < 12){
        am_pm_var = 'AM'
    } else {
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

    //fechas
    var meses = new Array('Enero', "Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto", "Septiembre","Octubre","Noviembre","Diciembre")
    var fechaactual = new Date()
    var tiempoact= (fechaactual.getDate() + ' de ' + meses[fechaactual.getMonth()] + ' de ' + fechaactual.getFullYear())
    var horaactual = (fechaactual.getHours() + ' : ' + fechaactual.getMinutes() + ' : ' + fechaactual.getSeconds())

    var data_servicios = {
        name_serv : req.body.name_serv,
        targetsell: req.body.targetsell,
        tipo_serv : req.body.tipo_serv,
        desc_serv : req.body.desc_serv,
        origin_serv : req.body.origin_serv,
        especialidades_serv : req.body.especialidades_serv,
        hora_creacion : horaactual,
        fecha_creacion : tiempoact,
        nuevafecha : nuevafecha,

        //time
        hora_apertura : req.body.horainicio,
        hora_cierre : req.body.horafinal,
        dia_aper : req.body.dia_i,
        dia_cierr : req.body.dia_f,

        imageServicios : '/images/services/img_defect_services.jpg',
        creator: iduser,
        deleted : false
    }

    var data_serv = new Servicios(data_servicios)
    var result = {state : 0, msg : 'No se pudo registrar'};
    var files = JSON.parse(req.body.files);

    if(files.length){
        function saveData(newRoute){
            data_serv.imageServicios = newRoute;
            data_serv.save(function(err){
                if(!err){
                    req.flash('messageprod' , 'Servicio ' + data_serv.name_serv + ', creado')

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
        data_serv.save(function(err){
            if(!err){
                req.flash('messageprod' , 'Servicio ' + data_serv.name_serv + ', creado')

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

controller.serviceViewDetail = (req,res) => {
    var id_services = req.params.id

    Servicios.findById({'_id': id_services}, function(err, servicios){
        if(err){
            res.redirect('/Dintair/messages')
            return
        }

        var files = '';

        if(servicios.imageServicios != '' ){
            files = servicios.imageServicios.split('---');
        }

        servicios.files = files;

        res.render('views/spanish/services/viewService', {
            data_serv: servicios, 
            user : req.user
        })
      
    })
}

controller.editServiceView = (req,res) => {
    var id_services = req.params.id

    Servicios.findById({'_id': id_services}, function(err,servicios){
      var files = '';

      if(servicios.imageServicios != '' ){
          files = servicios.imageServicios.split('---');
      }

      servicios.files = files;

      res.render('views/spanish/services/editServiceView', {
        data_serv: servicios, 
        user : req.user
      })
    })
}

controller.editServicePut = (req,res) => {
    res.setHeader('Content-Type', 'application/json');

    var data_serv_user = {
        name_serv : req.body.name_serv,
        targetsell: req.body.targetsell,
        tipo_serv : req.body.tipo_serv,
        desc_serv : req.body.desc_serv,
        origin_serv : req.body.origin_serv,
        especialidades_serv : req.body.especialidades_serv,
        imageServicios: req.body.fileOld,
        //time
        hora_apertura : req.body.horainicio,
        hora_cierre : req.body.horafinal,
        dia_aper : req.body.dia_i,
        dia_cierr : req.body.dia_f
    }

    var result = {state : 0, msg : 'No se pudo registrar'};
    var files = JSON.parse(req.body.files);

    if(files.length){
        Servicios.findByIdAndUpdate({'_id': req.params.id}, data_serv_user, function(servicios){
            result = {
                state : 1,
                msg : 'ok datos',
                data: {url: '/Dintair/kindProduct'}
            };
        })

        function saveData(newRoute){
            data_serv_user.imageServicios = newRoute;

            Servicios.findByIdAndUpdate({'_id': req.params.id}, data_serv_user, function(err){
                if(!err){
                    req.flash('messageprod' , 'Servicio ' + data_serv_user.name_serv + ' modificado')

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
        Servicios.findByIdAndUpdate({'_id': req.params.id}, data_serv_user, function(err){
            if(!err){
                req.flash('messageprod' , 'Servicio ' + data_serv_user.name_serv + ' modificado')

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


controller.deleteServicePut = (req,res) => {
    
    var id_services = req.params.id
    // var username = req.params.username 

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

    var data_servicios = {
        deleted : true,
        deleteDate : tiempoact,
        deleteTime : nuevafecha
    }

    Servicios.findByIdAndUpdate({'_id': id_services}, data_servicios, function(err){
        if(!err){
            console.log('después de update' + data_servicios)
            res.redirect('/Dintair/kindProduct')
            return
        } else {
            console.log('después de update' + data_servicios)
            console.log(err)
            res.redirect('/Dintair/kindProduct')
        }
    })
}

//   app.get('/Dintair/services/user/view/:id', isLoggedIn, (req,res)=>{
//     var id_services = req.params.id

//     Servicios.findByIdAndUpdate(req.params.id, {$inc: {vistas: 1}}, function(err, servicios){
      
//       if(err){
//         res.redirect('/Dintair/messages')
//         return
//       }
//       var files = '';

//       if(servicios.imageServicios != '' ){
//           files = servicios.imageServicios.split('---');
//       }

//       servicios.files = files;

//       res.render('espanol/forusers/services/viewotherserviceuser', {
//         data_serv: servicios, 
//         user : req.user
//       })
//     })
//   }),

module.exports = controller;