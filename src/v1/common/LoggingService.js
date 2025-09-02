const queryWrapper = require('../../database/queryWrapperMysql')

async function logService(PID, SID, TID, CID, data, request, response, statusCode = null, url = null) {
    return new Promise(function (resolve, reject) {
        var query = "INSERT INTO logsforservices (p_id, sid, tid, cid, data, request, response, statusCode, url) VALUES (?)";
        queryWrapper.executedev(query, [[PID, SID, TID, CID, data, request, response, statusCode, url]], function (responseData) {
            if (responseData.errno && responseData.errno !== undefined) {
                resolve({ success: false, error: responseData })
            } else {
                resolve({ success: true, data: responseData });
            }
        });
    })
}

async function logsReporting(step ,request, executedQuery,  fileName, reportid, status) {
    return new Promise(function (resolve, reject) {
        let currentDate = new Date();
        var query = "INSERT INTO logsforreporting (step, request, executedQuery, fileName, reportId, status, date) VALUES (?)";
        queryWrapper.executedev(query, [[step, request, executedQuery, fileName, reportid, status, currentDate]], function (responseData) {
            if (responseData.errno && responseData.errno !== undefined) {
                resolve({ success: false, error: responseData })
            } else {
                resolve({ success: true, data: responseData });
            }
        });
    })
}
module.exports = {
    logService : logService,
    logsReporting: logsReporting
}