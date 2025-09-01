const mysql = require("./databaseSetupMysql");

exports.execute = function (query, bindValuesArray) {
  return new Promise((resolve, reject) => {
    mysql.pool.getConnection((err, connection) => {
      if (err) {
        createLoggoingInDevDb(query, bindValuesArray, err);
        return reject(err);
      }
 
      if (!connection) {
        return reject(new Error("No MySQL connection available"));
      }
 
      const formattedQuery = formatQueryWithEscaping(query, bindValuesArray, connection);
      console.log("Executing Query:", formattedQuery);
 
      connection.query(query, bindValuesArray, (error, resultData) => {
        // release AFTER query finishes
        connection.release();
 
        if (error) {
          createLoggoingInDevDb(query, bindValuesArray, error);
          return reject(error);
        }
 
        return resolve(resultData);
      });
    });
  });
};

async function createLoggoingInDevDb(query, data, error) {
  return new Promise((resolve, reject) => {
    mysql.devpool.getConnection(function (err, connection) {
      if (err) {
        resolve(err);
      } else {
        let tableName = process.env.NODE_ENV == "production" ? `sqlerrorlogging` : `sqlerrorlogging_staging`;
        queryToInsert = `INSERT INTO ${tableName} (query, data, error) VALUES ?`;
        let dataToInsert = [[[query, JSON.stringify(data), JSON.stringify(error)]]];
        connection.query(queryToInsert, dataToInsert, function (error, resultData) {
          console.log(resultData);
          resolve(resultData);
        });
      }
    });
  });
}

function formatQueryWithEscaping(query, values, connection) {
  if (!values || values.length === 0) return query;

  let index = 0;
  return query.replace(/\?/g, () => {
    if (index >= values.length) return "?";
    return connection.escape(values[index++]);
  });
}

exports.executeQuery = function (query, bindValuesArray, resultCallBack) {
  mysql.connection.query(query, bindValuesArray, function (error, resultData) {
    if (error) {
      resultCallBack(error);
    }
    if (resultData) {
      resultCallBack(resultData);
    }
  });
};

exports.executedev = function (query, bindValuesArray, resultCallBack) {
  mysql.devpool.getConnection((err, connection) => {
    console.log(err);
    if (err) {
    }

    if (connection) {
      connection.query(query, bindValuesArray, function (error, resultData) {
        if (error) {
          resultCallBack(error);
        }
        if (resultData) {
          resultCallBack(resultData);
        }
      });

      connection.release();
      if (err) throw err;
    }
    return;
  });
};

exports.executeStaging = function (query, bindValuesArray, resultCallBack) {
  mysql.StagingPool.getConnection((err, connection) => {
    if (err) {
    }

    if (connection) {
      connection.query(query, bindValuesArray, function (error, resultData) {
        if (error) {
          resultCallBack(error);
        }
        if (resultData) {
          resultCallBack(resultData);
        }
      });

      connection.release();
      if (err) throw err;
    }
    return;
  });
};

exports.executeDev7 = function (query, bindValuesArray) {
  
  return new Promise((resolve, reject) => {
    mysql.pool.getConnection((err, connection) => {
      if (err) {
         createLoggoingInDevDb(query, bindValuesArray, err);
          return reject(err);
      }

      if (connection) {
        connection.query(query, bindValuesArray, function (error, resultData) {
          
          if (error) {
           
            reject(error);
          }
          if (resultData) {
            resolve(resultData);
          }
        });

        connection.release();
      }
    });
  });
};
