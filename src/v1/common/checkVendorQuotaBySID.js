async function checkVendorQuotaBySID(SID,VendorId,isVendorEnable){
    var data = {};
    return new Promise(function(resolve, reject) {

        if(isVendorEnable === 1 || isVendorEnable === "1"){
            var query = "SELECT * FROM mappings WHERE thirdPartyId = '" + VendorId + "' AND studyId = '"+ SID +"'";
            queryWrapper.execute(query, [], function (result) {
            if (result.errno && result.errno !== undefined) {
                    data.result = false;
                    resolve(data);
            } else {
                if(result.length > 0 && result[0]  != undefined) {
                    if(result[0].totalRequirementCompleted === null){
                        result[0].totalRequirementCompleted = 0
                    }
                    let isRouter = false;
                    isRouter = result[0].totalQuota > result[0].totalRequirementCompleted;
                    data.result = isRouter;
                    resolve(data);
                } else {
                    data.result = true;
                    resolve(data);
                } 
            }
            ;
            });
        } else{
            data.result = true;
            resolve(data);
        }
    });
}

module.exports= {
    checkVendorQuotaBySID : checkVendorQuotaBySID
}