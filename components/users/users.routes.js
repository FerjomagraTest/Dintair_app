const router = require('express').Router()
const usersControllers = require('./users.controllers')

const multer = require('multer')

var storage = multer.diskStorage({
  destination: './uploads',
  filename: function(req,file,callback){
    callback(null, Date.now() + file.originalname)
  }
})

var imageFilter = function(req,file,cb){
  if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
    return cb(new Error('Only image files are allowed!'), false)
  }
  cb(null, true)
}

var upload = multer({
  storage: storage,
  imageFilter : imageFilter,
  limits: { fieldSize: 25 * 1024 * 1024 }
})

router.get('/Dintair/profile/user', isLoggedIn, usersControllers.userProfileView)

router.post('/Dintair/profile/user/:id/:comp_name', isLoggedIn, upload.single('imagePortada'), usersControllers.changePortrait)

router.post('/Dintair/picture/:id', isLoggedIn, upload.single('imgperfil'), usersControllers.changeLogo)

router.post('/Dintair/picture/market/:id', isLoggedIn, upload.single('imageMarket'), usersControllers.changeMarketLocalPicture)

router.get('/Dintair/profile/user/edit', isLoggedIn, usersControllers.editProfileView)

router.post('/Dintair/profile/user/:id', isLoggedIn, upload.single('imgperfil'), usersControllers.editProfilePut)

router.get('/Dintair/profile/resetPassword/:id', isLoggedIn, usersControllers.passwordResetView)

router.post('/Dintair/profile/resetPassword/:id', isLoggedIn, usersControllers.passwordResetPut)

function isLoggedIn(req,res,next){
    if (req.isAuthenticated()){
      return next()
    } 
    return res.redirect('/Dintair/es/Signin')
}

module.exports = router;