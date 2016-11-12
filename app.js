var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var routes = require('./routes/index');
var settings = require('./settings');
var app = express();

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');



app.use(flash())



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
	secret: settings.cookieSecret,
	key: settings.db,
	cookie: {
		maxAge: 1000*60*60*24*30
	},
	store: new MongoStore({
		// db:settings.db,
		url:'mongodb://localhost/'+settings.db,
		autoRemove:'native'
	})

}));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//设置静态文件路径
app.use(express.static(path.join(__dirname, 'public')));

//路由控制
routes(app);

//app在www中监听端口和服务器
module.exports = app;
