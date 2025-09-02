/**
 * getParticipantById will return the participant data
 */
async function getParticipantById( participantId){
    let resultData = [];

    return new Promise(function(resolve, reject) {
            // Do async job
            var query = "SELECT *  FROM participants WHERE _id = '" + participantId + "'";
            queryWrapper.execute(query, [], function (result) {
            result[0].success = true;
            resultData.push(result[0]);
            resolve(resultData);
            });     
        });
}

module.exports= {
    getParticipantById : getParticipantById
}