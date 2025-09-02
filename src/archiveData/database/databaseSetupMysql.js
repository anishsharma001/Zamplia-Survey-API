
// const mysql = require('mysql');

//   pool  = mysql.createPool({
//   connectionLimit : 50,
//   host: "zampliaarchiveddb.mysql.database.azure.com",  // ip address of server running mysql
//   port:  "3306",
//   user: "zampliaarchived@zampliaarchiveddb",    // user name to your mysql database
//   password: "Zamplia@Pr0jectX!",
//   database: "zampliaarchiveddb", // use the specified database
//   multipleStatements: true,
//   ssl: true
// });

var mysql = require('mysql');
var config;

config = {
    mysql_pool : mysql.createPool({
        connectionLimit : 50,
        host: "zampliaarchiveddb.mysql.database.azure.com",  // ip address of server running mysql
        port:  "3306",
        user: "zampliaarchived@zampliaarchiveddb",    // user name to your mysql database
        password: "Zamplia@Pr0jectX!",
        database: "zampliaarchiveddb", // use the specified database
        multipleStatements: true,
        ssl: true
      })
};





module.exports = config;

 


// module.exports={
//   pool:pool
// }