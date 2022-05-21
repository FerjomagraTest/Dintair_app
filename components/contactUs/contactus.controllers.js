const Sugerencia = require('./models/sugerencias')
const controller = {}

controller.contactusView = (req,res) => {

    res.render('views/spanish/contactus/contactus', {
        success : req.flash('success'),
        message : req.flash('messagesend'),
        messageReset : req.flash('resetMessage')
    })
}

controller.contactusPost = (req,res) => {
  
    
    var meses = new Array('Enero', "Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto",
        "Septiembre","Octubre","Noviembre","Diciembre")

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

    var horaactual = (fechaactual.getHours() + ' : ' + fechaactual.getMinutes() + ' : ' + fechaactual.getSeconds())
    var tiempoact= (fechaactual.getDate() + ' de ' + meses[fechaactual.getMonth()] + ' de ' + fechaactual.getFullYear())
    var fecha = (fechaactual.getDate()+'/'+meses[fechaactual.getMonth()]+'/'+fechaactual.getFullYear())

    var sugerencia = {
        
        name : req.body.name_p,
        mail : req.body.mail,
        select_type : req.body.select_type,
        text_suggest : req.body.text_suggest,
        fecha_act : fecha,
        fecha : tiempoact,
        fecha_hora : horaactual,
        nuevafecha : nuevafecha,

        status : false
    }

    var suggests = new Sugerencia(sugerencia)

    suggests.save(function(err){

        if(!err){
        req.flash('success', 'Mensaje enviado correctamente')
        res.redirect('/Dintair/contact')
            console.log(suggests)
        } else {
        res.render('/Dintair/contact')
            console.log('Sugerencia no enviada')
        }
    })
    
    
}

module.exports = controller;