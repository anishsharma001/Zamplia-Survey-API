/**
 * updateParticipantStatus will update participant status on pid.
 */
async function updateParticipantStatus(PID, pStatus){
    let resultData = [];
    return new Promise(function(resolve, reject) {
        var query = "UPDATE participants SET status = ? WHERE _id = '" + PID + "'";
        queryWrapper.execute(query, [pStatus], function (result) {
            let data = {};
            data.success = true;
            resultData.push(data);
            resolve(resultData);
        });
    });
}

module.exports= {
    updateParticipantStatus : updateParticipantStatus
}