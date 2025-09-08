// const mysql = require("mysql");
const env = require('../config/env');
const mysql = require("mysql2");
let pool;

if (process.env.NODE_ENV == "staging") {
  pool = mysql.createPool({
    connectionLimit: 20,
    host: process.env.MYSQL_HOST_STAGING, // ip address of server running mysql
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USERNAME_STAGING, // user name to your mysql database
    password: process.env.MYSQL_PASSWORD_STAGING,
    database: process.env.MYSQL_DATABASE_STAGING, // use the specified database
    multipleStatements: true,
    ssl: {},
  });
} else {
  pool = mysql.createPool({
    connectionLimit: 20,
    host: process.env.MYSQL_HOST, // ip address of server running mysql
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USERNAME, // user name to your mysql database
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE, // use the specified database
    multipleStatements: true,
  ssl: {},
  });
}

let devpool = mysql.createPool({
  connectionLimit: 20,
  host: process.env.MYSQL_HOST_DEV,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USERNAME_DEV,
  password: process.env.MYSQL_PASSWORD_DEV,
  database: process.env.MYSQL_DATABASE_DEV,
  multipleStatements: true,
  ssl: {},
});

let StagingPool = mysql.createPool({
  connectionLimit: 20,
  host: process.env.MYSQL_HOST_STAGING,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USERNAME_STAGING,
  password: process.env.MYSQL_PASSWORD_STAGING,
  database: process.env.MYSQL_DATABASE_STAGING,
  multipleStatements: true,
  ssl: {},
});

module.exports = {
  pool: pool,
  devpool: devpool,
  StagingPool: StagingPool,
};
