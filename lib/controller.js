var mysql = require('promise-mysql');
var srs = require('secure-random-string');

exports.addCaisse = function(req,res) {
  srs({ length:20 },function(err,sr) {
	mysql.createConnection({
	    host: 'localhost',
	    user: 'root',
	    password: 'dMy6bPYBhRYH',
	    database: 'customers'
	}).then(function(conn){
	    connection = conn ;
	    var sql='INSERT INTO push VALUES("",'+req.body.shop+','+req.body.id_cash_drawer+',"'+sr+'","","","","","",true) ON DUPLICATE KEY UPDATE url_longue ="'+sr+'"' ;
	    // var sql='INSERT INTO push VALUES("",139,1,"'+sr+'",true) ON DUPLICATE KEY UPDATE url_longue ="'+sr+'"' ;
	    console.log("SQL:",sql);
	    connection.query(sql,function(err){   
		    if(err) { console.log(err) ;
		  	res.json({ err:"erreur inscription screen.kerawen"});
		    } else {
			res.json({ id_shop: req.body.id_shop , id_cash_drawer: req.body.id_cash_drawer , url_longue : sr }) ;
		    }
	    connection.end()
	      
	    });
	}).catch(function(error) {
            console.log("erreur createConnection");
	});	    
    })
}

exports.getIms = function(sockName,cb) {
 mysql.createConnection({
	       		host: 'localhost',
                user: 'root',
                password: 'dMy6bPYBhRYH',
                database: 'customers'
	      }).then(function(conn) {
	            connection = conn ;
	            var sql='SELECT id_shop,id_cash_drawer,url_pub,url_logo FROM push WHERE url_longue ="'+sockName+'"' ;
		              return connection.query(sql).then(function(rows){      	
	             		connection.end();
					  	cb(rows[0]); 
				})
	     }).catch(function(error) {
	         console.log(error);
   });
}

exports.getUrls = function(shop,cashdrawer,cb){
		mysql.createConnection({
	    host: 'localhost',
        user: 'root',
        password: 'dMy6bPYBhRYH',
        database: 'customers'
	    }).then(function(conn) {
	            connection = conn ;
	            var sql='SELECT url_pub,url_logo,url_pub_thumb,url_logo_thumb FROM push WHERE id_shop ='+shop+' AND id_cash_drawer ='+cashdrawer ;
		              return connection.query(sql).then(function(rows){
	             		connection.end();
					  	cb(rows[0]); 
				})
	     }).catch(function(error) {
	         console.log(error);
   });
} 

exports.getUrlLongue = function(shop,cashdrawer,cb){
		mysql.createConnection({
	    host: 'localhost',
        user: 'root',
        password: 'dMy6bPYBhRYH',
        database: 'customers'
	    }).then(function(conn) {
	            connection = conn ;
	            var sql='SELECT url_longue FROM push WHERE id_shop ='+shop+' AND id_cash_drawer ='+cashdrawer ;
		              return connection.query(sql).then(function(rows){
	             		connection.end();
					  	cb(rows[0]); 
				})
	     }).catch(function(error) {
	         console.log(error);
   });
} 

exports.delUrls = function(shop,cashdrawer,type,cb) {
	mysql.createConnection({
	    host: 'localhost',
        user: 'root',
        password: 'dMy6bPYBhRYH',
        database: 'customers'
	    }).then(function(conn) {
	            connection = conn ;
	            var sql='UPDATE push SET url_'+ type +' = "" , url_'+ type +'_thumb = "" WHERE id_shop ='+shop+' AND id_cash_drawer ='+cashdrawer ;
		              console.log('delsql',sql);
		              connection.query(sql).then(function(){
	             	  connection.end();
					  cb({"success":true}); 
				})
	     }).catch(function(error) {
	         console.log(error);
   });
}

exports.setUrl = function(server_url,magasin,caisse,basename,nomfichier,cb) {
 mysql.createConnection({
	       	host: 'localhost',
                user: 'root',
                password: 'dMy6bPYBhRYH',
                database: 'customers'
	      }).then(function(conn) {
	            connection = conn ;
	            var sql='UPDATE push SET url_'+basename+' = "'+server_url+magasin+'/'+caisse+'/'+nomfichier+ 
	            		'" ,  url_'+basename+'_thumb = "'+server_url+magasin+'/'+caisse+'/thumb_'+nomfichier+
	            		'"   WHERE id_shop = '+magasin+' AND id_cash_drawer = '+ caisse ; 
		        connection.query(sql).then(function(){        
	             		connection.end();
					  	cb(); 
				})
	     }).catch(function(error) {
	         console.log(error);
   });
}
 
exports.getUrl4Raspberry = function(mac,cb) {
 mysql.createConnection({
	       	host: 'localhost',
                user: 'root',
                password: 'dMy6bPYBhRYH',
                database: 'customers'
	      }).then(function(conn) {
	            connection = conn ;
	            var sql='SELECT push.url_longue FROM push WHERE push.mac = "'+mac+'"'; 
		    console.log("SQL2:",sql);
		              return connection.query(sql).then(function(rows){
				      console.log(rows);
	             				connection.end();
					  	cb(rows[0]); 
				})
	     }).catch(function(error) {
	         console.log(error);
   });
}


