const getIp = require('../../Utility/getRequestedIpAddress');

async function validateIpAddress(req, SID, TID){
    var data = {};

    const userIPAddress = await getIp.getRequestedIpAddress(req);

    return new Promise(function(resolve, reject) {
            var query = "SELECT * FROM participants WHERE sid = '" + SID + "' AND participantIp = '" + userIPAddress + "'AND tid = '" + TID + "' LIMIT 1";
            queryWrapper.execute(query, [], function (result) {
            if (result.errno && result.errno !== undefined) {
                    data.result = false;
                    data.userIPAddress = userIPAddress;
                    resolve(data);
            } else {
                if(result.length > 0 && result[0]  != undefined) {
                    data.result = false;
                    data.userIPAddress = userIPAddress;
                    resolve(data);

                } else {
                    data.result = true;
                    resolve(data);
                } 
            }
            ;
            });
    });
}

module.exports= {
    validateIpAddress : validateIpAddress
}