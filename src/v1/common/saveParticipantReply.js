async function saveParticipantReply( requestedData){
    let resultData = [];
    let date = new Date();
    return new Promise(function(resolve, reject) {
        var column = ' selectedData, sid, tid, uid, participantId, query_text, option_text, is_correct, lang_code, createdAt, updatedAt, queryId';
                  var query = "INSERT INTO participantreply (" + column + ") VALUES ?";                
                  queryWrapper.execute(query, [[[requestedData.selectedData, requestedData.sid, requestedData.tid, requestedData.uid, requestedData.participantId, requestedData.query_text, requestedData.option_text, requestedData.is_correct, requestedData.lang_code, date, date, requestedData.queryId]]], function (result) {
            let data = {};
            data.success = true;
            resultData.push(data);
            resolve(resultData);
        });
    });
}

module.exports= {
    saveParticipantReply : saveParticipantReply
}