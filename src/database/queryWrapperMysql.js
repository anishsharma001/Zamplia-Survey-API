const mysql = require("./databaseSetupMysql");

exports.execute = async function(query, bindValuesArray) {
  try {
    const [rows] = await mysql.pool.promise().query(query, bindValuesArray);
    return rows;
  } catch (error) {
    createLoggoingInDevDb(query, bindValuesArray, error);
    throw error;
  }
};

async function createLoggoingInDevDb(query, data, error) {
  try {
    const tableName =
      process.env.NODE_ENV === "production"
        ? "sqlerrorlogging"
        : "sqlerrorlogging_staging";

    const insertQuery = `INSERT INTO ${tableName} (query, data, error,repo) VALUES (?, ?, ?,?)`;
    const insertData = [query, JSON.stringify(data), JSON.stringify(error), "zamplia_survey_api"];

    const [result] = await mysql.devpool.promise().query(insertQuery, insertData);
    console.log("Logged error:", result);
    return result;
  } catch (err) {
    console.error("Failed to log error:", err);
    return err;
  }
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
    if (err) {
      console.error("Connection error:", err);
      return resultCallBack(err);
    }

    connection.query(query, bindValuesArray, (error, resultData) => {
      connection.release(); // release AFTER query completes

      if (error) return resultCallBack(error);
      resultCallBack(null, resultData);
    });
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


exports.executeDev7 = async function(query, bindValuesArray) {
  try {
    const [rows] = await mysql.pool.promise().query(query, bindValuesArray);
    return rows;
  } catch (error) {
    // Log the error to your dev DB
    await createLoggoingInDevDb(query, bindValuesArray, error);
    throw error;
  }
};
