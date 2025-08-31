/**
 * particpantStatusUpdateWithLoi will update the URL given to participant.
 */
async function particpantStatusUpdateWithLoi( status, SID, TID, UID){

    let resultData = [];
    return new Promise(function(resolve, reject) {
        var query = "UPDATE participants SET status = ? , startLoi = ?, updatedAt = ?  WHERE sid = '" + SID + "' AND tid =  '" + TID + "' AND  uid = '" + UID + "'";
                      queryWrapper.execute(query, [ status, date, date], function (result) {
            let data = {};
            data.success = true;
            resultData.push(data);
            resolve(resultData);
        });
    });
}

module.exports= {
    particpantStatusUpdateWithLoi : particpantStatusUpdateWithLoi,
}