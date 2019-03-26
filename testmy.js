var mysql      = require('mysql');
var connection = mysql.createConnection({
 	host: 'localhost',
	user: 'root',
	password: 'dMy6bPYBhRYH',
	database: 'customers'
});

connection.connect();

connection.query('SELECT * FROM push', function (error, results, fields) {
	  if (error) throw error;
	    console.log('The solution is: ', results);
});

connection.end();

