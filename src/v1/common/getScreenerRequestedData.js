
async function getScreenerRequestedData( bodyData){
    var data = {};
    data.participantId = bodyData.participantId ;
    data.SID = bodyData.sid ;
    data.TID = bodyData.tid ;
    data.UID = bodyData.uid ;
    data.query_text = bodyData.query_text;
    data.option_text = bodyData.option_text;
    data.is_correct = parseInt(bodyData.is_correct);
    data.lang_code = bodyData.lang_code;
    data.queryId = bodyData.queryId;
    data.originParticipant = bodyData.originParticipant;
    data.vendorVariables = bodyData.allVariables;
    return data
}

module.exports= {
    getScreenerRequestedData : getScreenerRequestedData
}