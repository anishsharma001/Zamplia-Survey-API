async function setRouterStudyPID(PID, SID, UID, VendorId, originParticipant){
    let data = {};
    return new Promise(function(resolve, reject) {
        var queryUpdate = "UPDATE router_studies SET participant_id = '"+PID+"' where end_study_id = '"+ SID +"' AND user_id = '"+UID+"' AND vendor_id = '"+TID+"' AND Origion_participant_id = '"+originParticipant+"'";
            queryWrapper.execute(queryUpdate, [], function (result) {
            data.success = true;
            resolve(data);
        });
    });
}

module.exports= {
    setRouterStudyPID : setRouterStudyPID
}