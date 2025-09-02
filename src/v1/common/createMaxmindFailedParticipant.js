/**
 * createInitialParticipant will create a record for regular participant.
 */
async function createMaxmindFailedParticipant( 
    VendorId, 
    UID,
    userIPAddress,
    vendorVar3,
    participantLandingURL,
    maxMindScore,
    studyData,
    isParticipantRouter){

        let resultData = [];
        return new Promise(function(resolve, reject) {
                        var d = new Date();
                        var timeNow = d.getTime();
                        var dateNow = d.getDate();
                        var month = d.getMonth();
                        var yearNow = d.getFullYear();
                        var PID = "" + dateNow + yearNow + month + "PARCIPENT" + timeNow;
                        var surveyParticipantId2 = "" + dateNow + yearNow + month + "PARCIPENT" +UID+ timeNow;

                        var column = ' _id, sid, tid, uid, status, participantIp, createdAt, updatedAt, redirectStatus,var3,studyLoi,cpi,ir,isRouter, usermaxmindscore,surveyParticipantId,origionParticipant, participantLandingURL,isNoSidUser';
                        var query = "INSERT INTO participants (" + column + ") VALUES ?";

                        queryWrapper.execute(query, [[[PID, studyData._id, VendorId, UID,9, userIPAddress, d, d,"false",vendorVar3, studyData.loi, studyData.fees, studyData.ir, isParticipantRouter , maxMindScore, surveyParticipantId2,PID, participantLandingURL ,"0"]]], function (result) {
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
    createMaxmindFailedParticipant : createMaxmindFailedParticipant
}