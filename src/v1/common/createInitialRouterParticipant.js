/**
 * createInitialRouterParticipant will create a record for router participant.
 * Also 1 record will be created in router studies.
 * Also firstPartylink will be updated for participant
 * also first party link for participant returns
 */
async function createInitialRouterParticipant(StudyExchId, 
    VendorId, 
    UID,
    userIPAddress,
    vendorVar3, 
    LOI, 
    CPI, 
    IR,
    participantLandingURL,
    participantFirstPartyLink){

        let resultData = [];
        return new Promise(function(resolve, reject) {
                        var d = new Date();
                        var timeNow = d.getTime();
                        var dateNow = d.getDate();
                        var month = d.getMonth();
                        var yearNow = d.getFullYear();
                        var PID = "" + dateNow + yearNow + month + "PARCIPENTNOSID" + timeNow;
                        var surveyParticipantId2 = "" + dateNow + yearNow + month + "PARCIPENT" +UID+ timeNow;

                        var column = ' _id, sid, tid, uid, status, startLoi,  participantIp, createdAt, updatedAt, redirectStatus,var3,studyLoi,cpi,ir,isRouter, usermaxmindscore,surveyParticipantId,origionParticipant, participantLandingURL,isNoSidUser';
                        var query = "INSERT INTO participants (" + column + ") VALUES ?";

                        queryWrapper.execute(query, [[[PID, StudyExchId, VendorId, UID, 0 , d ,userIPAddress, d, d,"false",vendorVar3, LOI, CPI, IR, 1 , 0, surveyParticipantId2,PID, participantLandingURL ,"1"]]], function (result) {
                            if (result.errno && result.errno !== undefined) {
                                let data = {};
                                data.success = false;
                                resultData.push(data);
                                resolve(resultData);
                            } else {
                                let data = {};
                                data.success = true;
                                data.PID = PID;
                                resultData.push(data);
                                resolve(resultData); 
                            }
                        }); 
        });
}
module.exports= {
    createInitialRouterParticipant : createInitialRouterParticipant
}