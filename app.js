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

io.on("connection",function(socket) {   

    console.log("query:",socket.handshake.query) 

// fonction qui permet aux afficheurs kbox d'obtenir l'url qui sera lancée au démarrage  
    socket.on("urlraspberry",function(macadress,callback){
        console.log("MACADRESS:",macadress);
            Controller.getUrl4Raspberry(macadress,function(retour){
              callback(retour);
            })
    });

    socket.on("enregistrer",function(data,fnc) {
	    console.log("Enregistre");
	         socket.join(data.sockName);
      		 Controller.getIms(data.sockName,function(ret) {

		       console.log("connection afficheur de la caisse: ", data.sockName,JSON.stringify(ret)) ;         
          		fnc(ret);
      		 }); 
    }); // end socket.on enregistrer

    // La socket du client qui de deconnecte sort de la room (room=url_longue)
    socket.on("disconnect",function() { 
            socket.leave(socket.handshake.query.url_longue);
    })
})

// Afficheur de caisse
app.get("/mag/:url_longue",function(req,res) {
  res.render('index', { title: 'CAISSE KERAWEN' ,  url_longue: req.params.url_longue  });
});


// reception de ticket par HTTP (POST)
app.post("/ticket",function(req,res) {
	var to_c = req.body.url_longue ;
    if ( to_c != null ) {
       	io.sockets.in(to_c).emit("affiche_ticket",req.body.ticket);
		    res.end('ok');
	} else {
	      console.log("Brancher afficheur");
	}
})

//--- enrollement.
app.post('/enroll',Controller.addCaisse) ;

//--- upload image + css.
app.get('/formupload/:mag/:caisse',function(req,res) {
    res.render("formupload",{title:'gestion de la pub'});
})

//---
var makePath = function(path) {
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
}

app.get('/screenDecoUrls/:shop/:cashdrawer',function(req,res) {
    var shop = req.params.shop ;
    var cashdrawer = req.params.cashdrawer ;
    Controller.getUrls(shop,cashdrawer,function(ret){  
       var retour = JSON.stringify(ret);
        console.log(retour.toString());
        res.end(retour.toString());
    })
});

app.get('/delScreenDecoUrls/:shop/:cashdrawer/:type',function(req,res) {
    var shop = req.params.shop ;
    var cashdrawer = req.params.cashdrawer ;
    var type = req.params.type ;
    Controller.delUrls(shop,cashdrawer,type,function(ret) {
       var retour = JSON.stringify(ret);
        console.log(retour);
        res.end(retour.toString());
    })
});


app.post('/upload/', function (req, res) {
    var server_url = "https://screen.kerawen.com:3030/uploads/";
    var fields = [];
    var form = new formidable.IncomingForm();

    form.on('field',function(field,value){
           fields[field]=value;
    })

    form.on('fileBegin', function (name, file) {
        file.path = __dirname + '/uploads/' + file.name;
    });

    form.on('progress', function(bytesReceived, bytesExpected) {
         // console.log('progress')
    });

    form.on('file', function (name, file) {
         
        var magasin = fields['magasin'];
        var caisse = fields['caisse'];
        var nomfichier = fields['nomfichier']; // nom fichier avec extension (ex: pub.jpg)
        var basename = fields['basename']; // nom fichier sans extension (ex: pub)
    
        fs.ensureDir('public/uploads/'+magasin+'/'+caisse+'/',function(){
          var source =  fs.createReadStream(__dirname + '/uploads/' + file.name);
          var dest   =  fs.createWriteStream(__dirname + '/public/uploads/' + magasin + '/' + caisse + '/' + nomfichier );

          source.pipe(dest);

          source.on('end', function() { 
		        console.log('-> fichier chargé'); 

            		im.identify(__dirname + '/public/uploads/' + magasin + '/' + caisse + '/' + nomfichier ,function(err,features){
              		if (err) throw err;
              			// console.log(features);
            		})

	          	im.resize({
		             srcPath: __dirname + '/public/uploads/' + magasin + '/' + caisse + '/' + nomfichier ,
		             dstPath: __dirname + '/public/uploads/' + magasin + '/' + caisse + '/thumb_'+nomfichier ,
		             width: 150 }, function(err,stdout,stderr) {
			               if (err) throw err;
                     // la reponse se fait à la fin du resize
                     console.log("-> miniature créée");
                      
                      Controller.setUrl(server_url , magasin, caisse, basename , nomfichier,function(ret) { 

                        res.end('{ "url'+basename+'_thumb" : "'+server_url+magasin+'/'+caisse+'/thumb_'+nomfichier+'" , "url'+basename+'" : "'+server_url+magasin+'/'+caisse+'/'+nomfichier+'" }');
                        // recup url longue
                        Controller.getUrlLongue(magasin,caisse,function(url) {
                          var urlref = server_url+magasin+'/'+caisse+'/'+nomfichier ;
                          io.sockets.in(url.url_longue).emit("refresh"+basename,{ "urlref": urlref });
                        })
                      })
		             });
	         });

          source.on('error', function(err) { console.log('error'); });        
        })
    });

    form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});
      // res.write('received upload:\n\n');
      // res.end(util.inspect({fields: fields}));    
      /*
          var magasin = fields['magasin'];
          var caisse = fields['caisse'];
          var nomfichier = fields['nomfichier'];
          res.end('{ "magasin": "'+magasin+'", "caisse": "'+caisse+'", "nomfichier": "thumb_'+ nomfichier +'" }');
      */

    });
});

server.listen(3030);