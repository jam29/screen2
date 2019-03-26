var mysql = require('mysql');
var srs = require('secure-random-string');

var connection = mysql.createConnection({
 	host: 'localhost',
	user: 'root',
	password: 'dMy6bPYBhRYH',
	database: 'customers'
});


	connection.connect();
//
// récup les urls des images. Si la caisse n'existe pas dans push elle est créée.
//
exports.getUrls = function(shop,cashdrawer,cb) {
	        srs({ length:20 },function(err,sr) { 
	            	var sql='INSERT IGNORE INTO push SET id_shop='+shop+',id_cash_drawer='+cashdrawer+',url_longue="'+sr+'"'
	            	connection.query(sql,function(error) {
	            	var sql2='SELECT url_pub,url_logo,url_pub_thumb,url_logo_thumb FROM push WHERE id_shop ='+shop+' AND id_cash_drawer ='+cashdrawer ;
		        connection.query(sql2,function(error,rows){
				console.log(rows[0]);
	                        
		  		cb(rows[0]); 
			  })
	     		})
	        })
} 
