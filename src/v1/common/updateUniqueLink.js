
async function updateUniqueLink(LinkId, PID){
    let resultData = [];
    return new Promise(function(resolve, reject) {
        var query = "UPDATE uniquelink SET isActive = ?, participantId = ?   WHERE _id = '" + LinkId + "'";
        queryWrapper.execute(query, [0,PID], function (result) {
            let data = {};
            data.success = true;
            resultData.push(data);
            resolve(resultData);
        });
    });
}

module.exports= {
    updateUniqueLink : updateUniqueLink
}