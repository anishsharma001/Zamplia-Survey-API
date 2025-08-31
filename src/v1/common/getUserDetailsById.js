/**
 * getParticipantById will return the userData data
 */
queryWrapper = require('../../database/queryWrapperMysql');
async function getUserDetailsById( uid){
    let resultData = [];

    return new Promise(function(resolve, reject) {
            // Do async job
            var query = "select * from users where user_id = '" + uid + "'";
            queryWrapper.execute(query, [], function (result) {
            result[0].success = true;
            resultData.push(result[0]);
            resolve(resultData);
            });     
        });
}

module.exports= {
    getUserDetailsById : getUserDetailsById
}