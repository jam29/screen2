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
  key: fs.readFileSync('/var/www/clients/client0/web22/ssl/new-key.pem'),
  cert: fs.readFileSync('/var/www/clients/client0/web22/ssl/new-cert.pem'),
  ca: fs.readFileSync('/var/www/clients/client0/web22/ssl/new-bundle.pem')
}

var app     = express();
var server  = https.createServer(options,app);

app.all('*', function (req, res, next) {
	  console.log('GET,POST,DEL...etc...')
	  next() // pass control to the next handler
});

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

var Controller = require('./lib/controllerpool.js');

io.on("connection",function(socket) {   

// fonction qui permet aux afficheurs kbox d'obtenir l'url qui sera lancée au démarrage  
// recup de l'url longue à partir de la MACADRESS de la kbox sur la table push (kerawen.com)
// c'est le node de printcart sur raspberry qui emet
socket.on("urlraspberry",function(macadress,callback){
  Controller.getUrl4Raspberry(macadress,function(retour){
	  console.log(retour);
    callback(retour);
  })
});

// quand un écran de caisse est chargé
socket.on("enregistrer",function(data,fnc) {
 socket.join(data.sockName);
 Controller.getIms(data.sockName,function(ret) {
   console.log("connection ecran de la caisse: ", data.sockName,JSON.stringify(ret)) ;         
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

// reception de ticket par HTTP (POST) pour afficher le ticket sur l'écran.
app.post("/ticket",function(req,res) {
	console.log(req.body);
    var to_c = req.body.url_longue ;
    if ( to_c != null ) {
	  console.log(req.body.ticket);
    io.sockets.in(to_c).emit("affiche_ticket",req.body.ticket);
    res.end('ok');
  } else {
   console.log("Brancher ecran client");
 }
})

//--- enrollement.
app.post('/enroll', function(req,res) { 
  console.log(req.body);
  Controller.check_licence_key(req.body.shop,req.body.key,function(isok){if(!isok) res.json('BAD')  });
  Controller.addCaisse(req,res) 
}) ;


//---
var ticket_test = '{"id":31,"shop":"1","id_lang":"1","id_address_delivery":0,"id_address_invoice":0,"cust":{"id":null,"firstname":null,"lastname":null,"email":null},"quote":0,"quote_expiry":null,"quote_title":null,"quote_pdf":"http:\/\/localhost:8888\/prestashop\/index.php?id_cart=31\u0026action=download\u0026fc=module\u0026module=kerawen\u0026controller=quotenext\u0026id_shop=1","id_empl":1,"delivery":{"mode":"0","date":null,"address":null,"carrier":null,"carriers":[]},"count_cart":6,"total_cart":308.89,"total_cart_vat_excl":257.41,"total_vat":51.48,"products":[{"prod":8,"attr":"0","name":"PANTALON","version":null,"reference":"NEW","qty":1,"unit":40.8,"price":40.8,"unit_init":40.8,"price_init":40.8,"img":"\/\/localhost:8888\/prestashop\/24-home_default\/pantalon.jpg","date":"2017-09-20 16:16:30","note":null,"discount_type":null,"discount":null,"specific":false,"wm":null,"rate":20,"vat_margin":0,"wholesale_price":0},{"prod":9,"attr":"0","name":"JEAN DIESEL","version":null,"reference":"NEW","qty":1,"unit":144,"price":144,"unit_init":144,"price_init":144,"img":null,"date":"2017-09-20 16:16:37","note":null,"discount_type":null,"discount":null,"specific":false,"wm":null,"rate":20,"vat_margin":0,"wholesale_price":0},{"prod":14,"attr":"0","name":"PULL","version":null,"reference":"NEW","qty":1,"unit":48,"price":48,"unit_init":48,"price_init":48,"img":null,"date":"2017-09-20 16:24:26","note":null,"discount_type":null,"discount":null,"specific":false,"wm":null,"rate":20,"vat_margin":0,"wholesale_price":0},{"prod":1,"attr":"1","name":"T-shirt d\u00e9lav\u00e9 \u00e0 manches courtes","version":"S, Orange","reference":"demo_1","qty":1,"unit":19.812,"price":19.81,"unit_init":19.812,"price_init":19.812,"img":"\/\/localhost:8888\/prestashop\/1-home_default\/t-shirt-delave-manches-courtes.jpg","date":"2017-09-22 10:23:46","note":null,"discount_type":null,"discount":null,"specific":false,"wm":null,"rate":20,"vat_margin":0,"wholesale_price":4.95},{"prod":7,"attr":"34","name":"Robe en mousseline imprim\u00e9e","version":"S, Jaune","reference":"demo_7","qty":1,"unit":19.681187,"price":19.68,"unit_init":24.601483,"price_init":24.601483,"img":"\/\/localhost:8888\/prestashop\/20-home_default\/robe-mousseline-imprimee.jpg","date":"2017-09-22 12:55:31","note":null,"discount_type":"percentage","discount":0.2,"specific":{"id_specific_price":"2","id_specific_price_rule":"0","id_cart":"0","id_product":"7","id_shop":"0","id_shop_group":"0","id_currency":"0","id_country":"0","id_group":"0","id_customer":"0","id_product_attribute":"0","price":"-1.000000","from_quantity":"1","reduction":"0.200000","reduction_tax":"1","reduction_type":"percentage","from":"0000-00-00 00:00:00","to":"0000-00-00 00:00:00","score":"0"},"wm":null,"rate":20,"vat_margin":0,"wholesale_price":6.15},{"prod":6,"attr":"31","name":"Robe d\u0027\u00e9t\u00e9 imprim\u00e9e","version":"S, Jaune","reference":"demo_6","qty":1,"unit":36.603083,"price":36.6,"unit_init":36.603083,"price_init":36.603083,"img":"\/\/localhost:8888\/prestashop\/16-home_default\/robe-ete-imprimee.jpg","date":"2017-09-22 12:55:35","note":null,"discount_type":null,"discount":null,"specific":false,"wm":null,"rate":20,"vat_margin":0,"wholesale_price":9.15}],"returns":[],"count_ret":0,"total_ret":0,"reducs":[],"version":"1506077674","prefix":"","suffix":" \u20ac"}';
var ticket_demo = function(url) {
  console.log("TICKET_DEMO",url)
   io.sockets.in(url).emit("affiche_ticket", ticket_test);
}


app.post('/overridecss',function(req,res) {
   var path_folder = 'public/uploads/'+req.body.shop+'/'+req.body.id_cash_drawer+'/' ;
    fs.ensureDir( path_folder , function(){
              fs.writeFile(path_folder+'style.css',req.body.css,function(err) { 
                     if (err) { res.end( "err" ) }
                     else     { 
                      ticket_demo(req.body.url) ;
                      io.sockets.in(req.body.url).emit("refreshcss",{ shop:req.body.shop , cashdrawer: req.body.id_cash_drawer });
                      res.end("success") ;  }
              })
    });
});

/*
//--- upload image + css.
app.get('/formupload/:mag/:caisse',function(req,res) {
    res.render("formupload",{title:'gestion de la pub'});
})
*/

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
  console.log("recherche deco pour:", shop," et ",cashdrawer );
  Controller.getUrls(shop,cashdrawer,function(ret){  
   var retour = JSON.stringify(ret);
   res.end(retour.toString());
 })
});

app.post('/delScreenDecoUrls/:shop/:cashdrawer/:type',function(req,res) {
  Controller.check_licence_key(req.params.shop,req.body.key,function(isok){ 
    if(!isok) { res.end("BAD") } else {
      var shop = req.params.shop ;
      var cashdrawer = req.params.cashdrawer ;
      var type = req.params.type ;
      Controller.delUrls(shop,cashdrawer,type,function(ret) {
        var retour = JSON.stringify(ret);
        res.end(retour.toString());
      })
    }
  })
})

app.post('/upload/', function (req, res) {
  var server_url = "https://screen.kerawen.com:3030/uploads/";
  var fields = [];
  var form = new formidable.IncomingForm();

  form.on('field',function(field,value) {
    fields[field]=value;
    if(fields['magasin'] && fields['key']) { 
      Controller.check_licence_key(fields['magasin'],fields['key'],function(isok){  if(!isok) res.end('BAD') });
    }
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
  //}}); //else 
});

server.listen(3030);
