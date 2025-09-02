/**
 * getVendorRedirectUrl will create vendor redirect url for PID and will also update into participants record  on pid
 */
async function getVendorRedirectUrl(SID,VendorId){
    var data = {};
    return new Promise(function(resolve, reject) {
        var query = "SELECT * FROM mappings WHERE thirdPartyId = '" + VendorId + "' AND studyId = '"+ SID +"'";
        queryWrapper.execute(query, [], function (result) {
        if (result.errno && result.errno !== undefined) {
                data.result = false;
                resolve(data);
        } else {
            if(result.length > 0 && result[0]  != undefined) {
                data.mappingData = result[0];
                resolve(data);
            } else {
                data.result = false;
                resolve(data);
            } 
        }
        ;
        });
    });
}

module.exports= {
    getVendorRedirectUrl : getVendorRedirectUrl
}