const queryWrapper = require('../../database/queryWrapperMysql');
module.exports.insertRecord=async function (dataQuery,record) {
    var isAvailable = [];
    var data = {};
    return new Promise(function (resolve, reject) {
        var query = dataQuery;
        queryWrapper.execute(query, [record], function (result) {
            if (result.errno && result.errno !== undefined) {
                data.result = false; 
                isAvailable.push(data);
            } else {
                if (result.length > 0 || (result.hasOwnProperty('affectedRows') && result.affectedRows > 0)) {
                    data.result = true;
                    data.studyData = result;
                    isAvailable.push(data);
                } else {
                    data.result = false;
                    isAvailable.push(data);
                }
            }
            resolve(isAvailable);
        });
    });
}
