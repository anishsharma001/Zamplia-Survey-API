async function checkValidParticipant( SID, TID, UID){
    var isAvailable = [];
    var data = {};
    return new Promise(function(resolve, reject) {
        var queryCheckIp = "SELECT * FROM participants WHERE sid = '" + SID + "' AND uid = '" + UID + "'AND tid = '" + TID + "'";
              queryWrapper.execute(queryCheckIp, [], function (result) {
            if (result.errno && result.errno !== undefined) {
                data.result = false;
                isAvailable.push(data);
            } else {
                if(result.length > 0) {
                    data.result = true;
                    data.validParticipantData = result[0];
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

module.exports= {
    checkValidParticipant : checkValidParticipant
}