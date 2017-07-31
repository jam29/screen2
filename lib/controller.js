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
	    var sql='INSERT INTO push VALUES("",'+req.body.shop+','+req.body.id_cash_drawer+',"'+sr+'",true) ON DUPLICATE KEY UPDATE url_longue ="'+sr+'"' ;
	    //var sql='INSERT INTO push VALUES("",139,1,"'+sr+'",true) ON DUPLICATE KEY UPDATE url_longue ="'+sr+'"' ;
	    console.log(sql);
	    connection.query(sql,function(err){   
		    if(err) { console.log(err) ;
		  	res.json({ err:"erreur inscription screen.kerawen"});
		    } else {
			res.json({ id_shop: req.body.id_shop , id_cash_drawer: req.body.id_cash_drawer , url_longue : sr }) ;
		    }
	    
	    });
	}).catch(function(error) {
            console.log("erreur createConnection");
	});	    
	// res.json({ id_shop: req.body.id_shop , id_cash_drawer: req.body.id_cash_drawer , url_longue : sr }) ;
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
	            var sql='SELECT id_shop,id_cash_drawer FROM push WHERE url_longue ="'+sockName+'"' ;
		    console.log("SQL:",sql);
		              return connection.query(sql).then(function(rows){
					  	cb(rows[0]); 
				})
	     }).catch(function(error) {
	         console.log(error);
   });
}

