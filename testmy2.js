var async = require('async');
var im = require('imagemagick');
var express = require('express');
var Session = require('express-session');

// var passport = require('passport');
// var localStrategy = require('passport-local').Strategy ;

var fs = require('fs-extra');
var util = require('util');

var socket = require('socket.io')({transport:['websocket']});
var cors = require('cors');

var path = require('path');
var http = require('http');
var https = require('https');
var favicon = require('serve-favicon');
var morgan = require('morgan');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var formidable = require('formidable');

var options = {
  key: fs.readFileSync('/var/www/clients/client0/web22/ssl/screen.kerawen.com.key'),
  cert: fs.readFileSync('/var/www/clients/client0/web22/ssl/screen.kerawen.com.crt')
}

var app     = express();
var server  = https.createServer(options,app);

// redirection http -> https
var http = require('http');
http.createServer(function (req, res) {
  var hs = (req.headers['host']).replace("3020","3030");
  res.writeHead(301, { "Location": "https://" + hs + req.url });
  res.end();
}).listen(3020);

var accessLogStream = fs.createWriteStream(__dirname + '/access.log', { flags: 'a' })
app.use(morgan('combined', {stream: accessLogStream}))

accessLogStream.write("DEMARRAGE SERVER :"+new Date());

app.use(cors());

var io = socket.listen(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var Controller = require('./lib/controller.js');

app.get('/screenDecoUrls/:shop/:cashdrawer',function(req,res) {
  var shop = req.params.shop ;
  var cashdrawer = req.params.cashdrawer ;

  Controller.getUrls(shop,cashdrawer,function(ret){  
   var retour = JSON.stringify(ret);
   res.end(retour.toString());
 })
});

server.listen(3030);
