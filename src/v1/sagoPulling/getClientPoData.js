queryWrapper = require('../../database/queryWrapperMysql');
module.exports.getClientPoData = async function () {
    return new Promise(function (resolve, reject) {
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let query = "Select * from clientsPoPid where month = '" + month + "' AND year = '" + year + "' AND clientId = '1208157854376client' ";
        queryWrapper.execute(query, [], function (result) {
            if (result.errno && result.errno !== undefined) {
                resolve([]);
            } else if (result.length == 0) {
                resolve([]);
            } else {
                resolve(result);
            }
        });
    });
}