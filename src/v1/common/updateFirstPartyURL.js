/**
 * updateFirstPartyURL will update the URL given to participant.
 */
async function updateFirstPartyURL(PID,link){

    let resultData = [];
    return new Promise(function(resolve, reject) {
        var query = "UPDATE participants SET participantRedirect = ? WHERE _id = '" + PID + "'";
        queryWrapper.execute(query, [link], function (result) {
            let data = {};
            data.success = true;
            resultData.push(data);
            resolve(resultData);
        });
    });
}

module.exports= {
    updateFirstPartyURL : updateFirstPartyURL,
}