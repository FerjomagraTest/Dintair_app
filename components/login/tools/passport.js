const LocalStrategy = require('passport-local').Strategy
//const fs = require('fs')
const User = require('../../users/models/user')
//const nodemailer = require('nodemailer')
const crypto = require('crypto')
//const mysql = require('mysql')



module.exports = function(passport){
	passport.serializeUser(function(user, done){
		done(null, user.id)
	});

	passport.deserializeUser(function(id, done){
		User.findById(id, function(err, user){
			done(err, user)
		})
	});

	//Login
	passport.use('local-signin', new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	}, 
	function(req, username, password, done){
		User.findOne({'username': username}, function(err,user){
			if(err){return done(err)}
			if(!user){
				return done(null, false, req.flash('loginMessage', 'Email o contraseña incorrectas'))
			}
			if(!user.validatePassword(password)){
				return done(null, false, req.flash('loginMessage', 'Email o contraseña incorrectas'))
			} 
			return done(null, user)
		})
	}));

}