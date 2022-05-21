const controller = {}
//dependecies
const mongoose = require('mongoose')

//tables
const Products = require('../products/models/products');
const Servicios = require('../services/models/services');
const User = require('../users/models/user')
const UserRecommended = require('../users/models/user_recommended')
const PublicationRecommendedLike = require('../publication/models/publication_recommended_like')
const PublicationRecommended = require('../publication/models/publication_recommended')


controller.loginRoute = (req,res) => {
    res.render('views/spanish/login/loginView', {
        message : req.flash('loginMessage')
    })
}

controller.homePage = (req,res) => {
    
    //res.send('Welcome to user view')

    function _publication (data, ids){
        //var filter = {creator:{$in: ids}}

        PublicationRecommended.find({}).populate('creator').exec(function(err, publications){
            if(err){
                res.redirect('/Dintair')
                return
            }

            data.publications = publications.reverse();
            res.render('views/spanish/usersInterface/home', data)
            //res.render('espanol/forusers/everestuser-recommendation', data);
        });

    }

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
  
              User.find({}, function(err, usuarios){
                if(err){
                    res.redirect('/Dintair')
                    return
                }
  
  
                var filter = {
                    $or: [
                        {user_id: req.user._id},
                        {user_contact_id: mongoose.Types.ObjectId(req.user._id)},
                    ]
                };
  
                UserRecommended.find(filter).exec(function(err, myContact){
                  var userId = [];
  
                  var data = {
                      user: req.user,
                      usuarios: usuarios.reverse(),
                      messwelcome : req.flash('messwelcome'),
                      success : req.flash('success'),
                      editprofile : req.flash('success'),
                      successAmb : req.flash('success'),
                      successeditAMB : req.flash('success'),
                      successIdiom : req.flash('success'),
                      succesPublic : req.flash('success'),
                      succesUsername : req.flash('successUsername'),
                      successPass : req.flash('successPass'),
                      myproducts : myproducts.reverse(),
                      myServices : myServices.reverse(),
                      publications: [],
                      myContact: userId,
                      myLike: []
                  }
  
                  userId.push(req.user._id.toString());
  
                  var countMyContact = myContact.length;
  
                  if(countMyContact > 0){
                      var index = 1;
  
                      myContact.map(function(item){
                          userId.push(item.user_id.toString());
  
                          if(index == countMyContact){
                              data.myContact = userId;
  
                              _like(data, userId);
                          }
  
                          index++;
                      });
                  } else {
                      _like(data, userId);
                  }
                })
              })
            }
          )
        }
      )
    
}



module.exports = controller;