const controller = {}
const User = require('../../users/models/user')
const Products = require('../../products/models/products')


controller.headerSearching = (req,res) => {
    res.setHeader('Content-Type', 'application/json');

    //productos
    
    var filter = {
    'nombre' : new RegExp(req.body.search, "i"),
    'deleted': false
    }; // ----> /value/i

    console.log(filter);

    switch(req.body.type) {
        case 'product':
            var filter = {
                'nombre' : new RegExp(req.body.search, "i"),
                'deleted': false
            }; // ----> /value/i

            Products.find(filter).limit(5).exec( function(err, docProduct){
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

            break;

        case 'business':
            var filter = {
                'comp_name' : new RegExp(req.body.search, "i"),
                'deleted': false
            }; // ----> /value/i

            User.find(filter).limit(5).exec( function(err, doc){
                if(doc){
                    var result = {
                        state: 1,
                        msg: 'ok!',
                        data: doc
                    }

                    console.log(doc);

                    res.send(JSON.stringify(result));
                } else {
                    var result = {
                        state: 0,
                        msg: 'No se pudo traer las empresas!',
                        data: {}
                    }

                    res.send(JSON.stringify(result));
                }
            })

            break;
        default:

    }
}

module.exports = controller;