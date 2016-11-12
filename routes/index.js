var express = require('express');
var router = express.Router();
var multer = require('multer');
var crypto = require('crypto'),
	  User = require('../models/user.js'),
    Post = require('../models/post.js'),
    Comment = require('../models/comment.js');

var storage = multer.diskStorage({
 //设置上传后文件路径，uploads文件夹会自动创建。
    destination: function (req, file, cb) {
        cb(null, './public/images')
   }, 
 //给上传文件重命名，获取添加后缀名
  filename: function (req, file, cb) {
      var fileFormat = (file.originalname).split(".");
      cb(null, file.originalname);
  }
 });  
 //添加配置文件到muler对象。
 var upload = multer({
      storage: storage
});


module.exports = function(app){
/* GET home page. */
app.get('/', function(req, res, next) {
  Post.getAll(null, function(err, posts){
      if (err) {
        posts = []
        req.flash('error',err)
      }
      res.render('index', { 
        title: '主页',
        user: req.session.user,
        posts: posts,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
     });
  });
  
});
app.get('/reg',checkNotLogin)
app.get('/reg', function(req, res, next) {
   res.render('reg', { 
      title: '注册',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
   });
});
app.post('/reg',checkNotLogin)
app.post('/reg', function(req, res, next) {
   var name = req.body.name,
       password = req.body.password,
       password_re = req.body['password-repeat'];
    
       if(password != password_re){

          req.flash('error','两次输入密码不一致');
          
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

            return res.redirect('/');
          }
          if(user){
            req.flash('error','用户已存在');
            return res.redirect('/reg');
          }

          newUser.save(function (err, user) {
            if(err){
              req.flash('error',err);
              return res.redirect('/reg');
            }

            req.session.user = user;
            req.flash('success','注册成功');
            return res.redirect('/');
          });
       })

});
app.get('/login',checkNotLogin)
app.get('/login', function(req, res, next) {
   res.render('login', { 
      title: '登陆',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
  });
});

app.post('/login',checkNotLogin)
app.post('/login', function(req, res, next) {
   var md5 = crypto.createHash('md5'),
       password = md5.update(req.body.password).digest('hex');

       User.get(req.body.name,function (err, user) {
          
          if (!user) {
            req.flash('error','用户不存在!');
            return res.redirect('/login');
          }
          if (user.password != password) {
            req.flash('error','密码错误!');
            return res.redirect('/login');
          }

         req.session.user = user;
         req.flash('success','登陆成功');
         return res.redirect('/');
       });
});
app.get('/logout',checkLogin)
app.get('/logout', function(req, res, next) {
    req.session.user = null;
    req.flash('success','登出成功');
    return res.redirect('/');
});

app.get('/post',checkLogin)
app.get('/post', function(req, res, next) {
   res.render('post', { 
        title: '发表',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
     });
});

app.post('/post',checkLogin)
app.post('/post', function(req, res, next) {
    var currentUser = req.session.user,
        post = new Post(currentUser.name, req.body.title, req.body.post);

        post.save(function(err){
            if (err) {
              req.flash('error', err);
              return res.redirect('/');
            }
            req.flash('success', '发布成功');
            res.redirect('/');
        });

});

app.get('/upload',checkLogin)
app.get('/upload', function(req, res, next) {
    res.render('upload', { 
        title: '文件上传',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
     });

});

app.post('/upload',checkLogin)
app.post('/upload',  upload.fields([
    {name: 'file1'},
]), function(req, res, next){
  var file = req.files.file1[0];
    console.log('原始文件名：%s', file.originalname);
    req.flash('success', '文件上传成功!');
    res.redirect('/upload');
});

app.get('/u/:name', function(req, res, next) {
    
    User.get(req.params.name, function(err, user){
        if (!user) {
          req.flash('error','用户名不存在');
          return res.redirect('/');
        }
      Post.getAll(user.name,function (err, posts) {
        if (err) {
            req.flash('error',err);
            return res.redirect('/');
        }
         
        res.render('user', { 
          title: user.name,
          posts: posts,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
       });
    })
  })

});
app.get('/u/:name/:day/:title', function(req, res, next) {
    
    Post.getOne(req.params.name,req.params.day,req.params.title, function(err, post){
        if (err) {
          req.flash('error',err);
          return res.redirect('/');
        }
        res.render('article', { 
          title: req.params.title,
          post: post,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
       });
    })

});
app.get('/edit/:name/:day/:title',checkLogin)
app.get('/edit/:name/:day/:title', function(req, res, next) {
    
    Post.edit(req.params.name,req.params.day,req.params.title, function(err, post){
        if (err) {
          req.flash('error',err);
          return res.redirect('/');
        }
        res.render('edit', { 
          title: '编辑',
          post: post,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
       });
    })

});
app.get('/remove/:name/:day/:title',checkLogin)
app.get('/remove/:name/:day/:title', function(req, res, next) {
    
    Post.remove(req.params.name,req.params.day,req.params.title, function(err, post){
        if (err) {
          req.flash('error',err);
          return res.redirect('back');
        }
        req.flash('success','删除成功');
        res.redirect('/')
    })

});

app.post('/edit/:name/:day/:title',checkLogin)
app.post('/edit/:name/:day/:title', function(req, res, next) {
    var currentUser = req.session.user;
    Post.update(currentUser.name,req.params.day,req.params.title,req.body.post, function(err){
        
        var url = encodeURI('/u/'+req.params.name+'/'+req.params.day+'/'+req.params.title);
        if (err) {
          req.flash("error",err)
          return res.redirect(url)
        }

        req.flash('success','修改成功');
        res.redirect(url)
    })

});

app.post('/u/:name/:day/:title', function (req, res) {
    var date = new Date,
        time = date.getFullYear() + '-' + (date.getMonth()+1) + '-'
              + date.getDate()+ ' ' + date.getHours() + ":" + date.getMinutes()

    var comment = {
        name: req.body.name,
        email:req.body.email,
        website: req.body.website,
        time: time,
        content: req.body.content
    }

    var newComment = new Comment(req.params.name, req.params.day,req.params.title,comment);
    newComment.save(function (err) {
        if (err) {
            req.flash('error', err)
            return res.redirect('back')
        }

         req.flash('success', '留言成功')
         return res.redirect('back')
    })
})



};

function checkLogin (req, res, next) {
    if (!req.session.user) {
      req.flash('error','未登录');
      res.redirect('/login');
    }
    next()
}
function checkNotLogin (req, res, next) {
    if (req.session.user) {
      req.flash('error','已登录');
      res.redirect('back');
    }
    next()
}