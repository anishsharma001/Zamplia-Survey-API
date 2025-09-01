const mysqlQuery = require('./databaseSetupMysql');

exports.execute = function (query, bindValuesArray, resultCallBack) {
    mysqlQuery.mysql_pool.query(query, bindValuesArray, function (error, resultData) {
        
        if (error){
            console.log(error);
            resultCallBack(error);
        }
        if(resultData){
            console.log(resultData);
            resultCallBack(resultData);
        } 
      });
    
  }

