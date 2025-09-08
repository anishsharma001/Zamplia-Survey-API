const mysql = require('mysql2');
const config = {
    mysql_pool : mysql.createPool({
        connectionLimit : 50,
        host: "zampliaarchiveddb.mysql.database.azure.com",  // ip address of server running mysql
        port:  "3306",
        user: "zampliaarchived@zampliaarchiveddb",    // user name to your mysql database
        password: "Zamplia@Pr0jectX!",
        database: "zampliaarchiveddb", // use the specified database
        multipleStatements: true,
        ssl: {}
      })
};





module.exports = config;

 


// module.exports={
//   pool:pool
// }