var app = require('./app.js');


app.set('port', process.env.PORT || 8080)
app.listen(app.get('port'), function(){
    console.log(`Servidor iniciado en puerto ${app.get('port')}`)
}); 