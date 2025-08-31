/**
 * updateVendorRedirectOnParticipant will update participant vendor redirect on pid.
 */
async function updateVendorRedirectOnParticipant(PID, vendorRedirectUrl, participantStatus){
    let resultData = [];
    return new Promise(function(resolve, reject) {
        var query = "UPDATE participants SET vendorRedirect = ?, status = ? WHERE _id = '" + PID + "'";
        queryWrapper.execute(query, [vendorRedirectUrl,participantStatus], function (result) {
            let data = {};
            data.success = true;
            resultData.push(data);
            resolve(resultData);
        });
    });
}

module.exports= {
    updateVendorRedirectOnParticipant : updateVendorRedirectOnParticipant
}