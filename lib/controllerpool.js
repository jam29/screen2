var connection = require('./mysql');
var srs = require('secure-random-string');

exports.check_licence_key = function(shop,key,cb) {
    			var sql="SELECT licence_key FROM shop WHERE id="+shop ;
			connection.query(sql,function(error,rows) {
				if (rows.length == 0) { cb(false) } else {
					if (rows[0].licence_key == key) { cb(true) } else { cb(false)}
				}
			}); 
}

// ajoute une caisse en créant l'url longue ou change l'url longue d'une caisse. 
exports.addCaisse = function(req,res) {
  srs({ length:20 },function(err,sr) {
	   var sql='INSERT INTO push VALUES(0,'+req.body.shop+','+req.body.id_cash_drawer+',"'+sr+'","","","","","",0,0) ON DUPLICATE KEY UPDATE url_longue ="'+sr+'"' ;
	   console.log("addCaisse:",sql);
	   connection.query(sql,function(err){   
		    if(err) { console.log(err) ;
		  		res.json({ err:"erreur inscription screen.kerawen"});
		    } else {
				res.json({ id_shop: req.body.id_shop , id_cash_drawer: req.body.id_cash_drawer , url_longue : sr }) ;
		    }
	    	});
    }) //srs
}

// obtient les images à partir d'une url longue.
exports.getIms = function(sockName,cb) {
	            var sql='SELECT id_shop,id_cash_drawer,url_pub,url_logo FROM push WHERE url_longue ="'+sockName+'"' ;
		              connection.query(sql, function(error,rows) {      	
					  	cb(rows[0]); 
			      })
}

//
// récup les urls des images. Si la caisse n'existe pas dans push elle est créée.
//
exports.getUrls = function(shop,cashdrawer,cb) {
	        srs({ length:20 },function(err,sr) { 
	            	var sql='INSERT IGNORE INTO push SET id_shop='+shop+',id_cash_drawer='+cashdrawer+',url_longue="'+sr+'"'
	            	connection.query(sql, function(err) {
	            		var sql2='SELECT url_pub,url_logo,url_pub_thumb,url_logo_thumb FROM push WHERE id_shop ='+shop+' AND id_cash_drawer ='+cashdrawer ;
				console.log("TESTER:",sql2);
		              	connection.query(sql2,function(error,rows){
					 console.log(rows[0]);
			  		 cb(rows[0]); 
					})
	     		})
	        })
} 

exports.getUrlLongue = function(shop,cashdrawer,cb) {
	            var sql='SELECT url_longue FROM push WHERE id_shop ='+shop+' AND id_cash_drawer ='+cashdrawer ;
		             connection.query(sql,function(error,rows) {
					 cb(rows[0]); 
			     })
} 

exports.delUrls = function(shop,cashdrawer,type,cb) {
	            var sql='UPDATE push SET url_'+ type +' = "" , url_'+ type +'_thumb = "" WHERE id_shop ='+shop+' AND id_cash_drawer ='+cashdrawer ;
		              connection.query(sql,function(error){
					  cb({"success":true}); 
				})
}

exports.setUrl = function(server_url,magasin,caisse,basename,nomfichier,cb) {
	            var sql='UPDATE push SET url_'+basename+' = "'+server_url+magasin+'/'+caisse+'/'+nomfichier+ 
	            		'" ,  url_'+basename+'_thumb = "'+server_url+magasin+'/'+caisse+'/thumb_'+nomfichier+
	            		'"   WHERE id_shop = '+magasin+' AND id_cash_drawer = '+ caisse ; 
		        connection.query(sql,function(error){        
			  	cb(); 
				})
}
 
exports.getUrl4Raspberry = function(mac,cb) {
	        var sql='SELECT push.url_longue FROM push WHERE push.mac = "'+mac+'" AND push.actif = 1'; 
		            connection.query(sql,function(error,rows){
				    console.log("in push table:",mac,':',rows);
				    cb(rows[0]); 
			    })
}
