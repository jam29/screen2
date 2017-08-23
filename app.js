var express = require('express');
var Session = require('express-session');

var passport = require('passport');
var localStrategy = require('passport-local').Strategy;

var fs = require('fs-extra');
var util = require('util');

var socket = require('socket.io');
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

var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'})
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

var caissesSockets = [];
io.on("connection",function(socket)
  {   
    
    socket.on("enregistrer",function(sockName,fnc) {
	        socket.join(sockName);
      		caissesSockets[sockName] = { "socket": socket.id } 
      		 Controller.getIms(sockName,function(ret) { 
		       console.log("connection afficheur de la caisse: ", sockName,JSON.stringify(ret)) ;
          		fnc(ret);
      		 }); 
    }); // end socket.on enregistrer

    socket.on("disconnect",function() { 
	    console.log ("client "+ socket.id+" deconnecté") ;
	    for (var key in caissesSockets ) {
	       console.log(key); 
	    }
    })

    /* 
    Reception de ticket par socket (ticket envoyé par curl par kerawen mais possibilité par socket
    socket.on("ticket:"+socket.handshake.query.url_longue+":"+socket.handshake.query.magasin+":"+socket.handshake.query.caisse,function(ticket) {
          var to_caisse = socket.handshake.query.url_longue+socket.handshake.query.magasin+socket.handshake.query.caisse ;
          if (caissesSockets[to_caisse]) {
            //var id = caissesSockets[to_caisse].socket ;
            io.to(to_c).emit("affiche_ticket",req.body.ticket);
          } else {
            socket.emit("caisse:out");
          }
    })
    */

    socket.on("affiche_pub",function() {
      var to_caisse = socket.handshake.query.url_longue+socket.handshake.query.magasin+socket.handshake.query.caisse
          var id = caissesSockets[to_caisse].socket;
          io.sockets.connected[id].emit("affiche_pub");
    })
  }
)

// Afficheur de caisse
app.get("/mag/:url_longue",function(req,res) {
  res.render('index', { title: 'CAISSE KERAWEN' ,  url_longue: req.params.url_longue  });
})

// reception de ticket par HTTP (POST)
app.post("/ticket",function(req,res) {
	console.log("TEMOIN:",req.body.url_longue);
	var to_c = req.body.url_longue ;
	var id = caissesSockets[to_c].socket;
        io.sockets.connected[id].emit("affiche_ticket",req.body.ticket);
	res.end('ok');
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


app.post('/upload/', function (req, res) {
    var fields = []
    var form = new formidable.IncomingForm();

    form.on('field',function(field,value){
           fields[field]=value;
    })

    form.on('fileBegin', function (name, file) {
        file.path = __dirname + '/uploads/' + file.name;
    });

    form.on('progress', function(bytesReceived, bytesExpected) {
         console.log('progress')
    });

    form.on('file', function (name, file) {
        console.log('Uploaded ' + file.name); 
    
        fs.ensureDir('public/uploads/'+fields['magasin']+'/'+fields['caisse']+'/',function(){
          var source = fs.createReadStream(__dirname + '/uploads/' + file.name);
          var dest =  fs.createWriteStream(__dirname + '/public/uploads/' + fields['magasin'] + '/' + fields['caisse'] + '/' + fields['nomfichier']);

          source.pipe(dest);
          source.on('end', function() { console.log('copied'); });
          source.on('error', function(err) { console.log('error'); });
        })
    });

    form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});
      //res.write('received upload:\n\n');
      //res.end(util.inspect({fields: fields}));    
      var magasin = fields['magasin'];
      var caisse = fields['caisse'];
      var nomfichier = fields['nomfichier'];
      res.end('{ "magasin": "'+magasin+'", "caisse": "'+caisse+'", "nomfichier": "'+ nomfichier +'" }');
    });
});

server.listen(3030);

