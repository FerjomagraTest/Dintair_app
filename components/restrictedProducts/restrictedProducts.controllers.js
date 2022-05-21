const Restricted_products = require('./models/restricted_products')

const controller = {}

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

module.exports = controller;