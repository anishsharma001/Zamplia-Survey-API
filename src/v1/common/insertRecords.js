const { executeDev7 } = require('../../database/queryWrapperMysql');

module.exports.insertRecord = async function (dataQuery, record) {
  try {
    // executeDev7 expects parameters as an array
    const result = await executeDev7(dataQuery, [record]);

    // Check if result indicates error
    if (result.errno && result.errno !== undefined) {
      return { result: false };
    }

    // Check if insert/update returned rows or affectedRows
    if (result.length > 0 || (result.hasOwnProperty('affectedRows') && result.affectedRows > 0)) {
      return { result: true, studyData: result };
    }

    // Default fallback
    return { result: false };
  } catch (error) {
    console.error('Error inserting record:', error);
    return { result: false };
  }
};
