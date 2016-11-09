var express = require('express');
var router = express.Router();
var crypto = require('crypto'),
	User = require('../models/user.js');

module.exports = function(app){
/* GET home page. */
app.get('/', function(req, res, next) {
  res.render('index', { title: '主页' });
});

app.get('/reg', function(req, res, next) {
   res.render('reg', { title: '注册' });
});

app.get('/login', function(req, res, next) {
   res.render('login', { title: '登陆' });
});
app.post('/login', function(req, res, next) {
   
});

app.get('/reg', function(req, res, next) {
   res.render('reg', { title: '发表' });
});
app.post('/reg', function(req, res, next) {
   var name = req.body.name,
   	   password = req.body.password,
   	   password_re = req.body['password-repeat'];
   	   console.log(password)
   	   console.log(password_re)
   	   console.log(password_re == password)
   	   if(password != password_re){

   	   		req.flash('error','两次输入密码不一致');
   	   		console.log('两次输入密码不一致')
   	   		return res.redirect('/reg');
   	   }

   	   var md5 = crypto.createHash('md5'),
   	   	   password = md5.update(req.body.password).digest('hex');

   	   var newUser = new User({
   	   		name: req.body.name,
   	   		password: password,
   	   		email: req.body.email
   	   });

   	   User.get(newUser.name, function (err, user) {
   	   		if(err){
   	   			req.flash('error',err);
                  console.log(1)
   	   			console.log(err)

   	   			return res.redirect('/');
   	   		}
   	   		if(user){
   	   			req.flash('error','用户已存在');
   	   			console.log('用户已存在')
   	   			return res.redirect('/reg');
   	   		}

   	   		newUser.save(function (err, user) {
   	   			if(err){
                     console.log(2)
   	   				console.log(err)
	   	   			req.flash('error',err);
	   	   			return res.redirect('/reg');
	   	   		}

	   	   		req.session.user = user;
   	   			req.flash('success','注册成功');
   	   			return res.redirect('/');
   	   		});
   	   })

});

app.get('/logout', function(req, res, next) {
   
});

};
