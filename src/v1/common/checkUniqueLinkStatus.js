
async function checkUniqueLinkStatus(SID, studyData){
    var data = {};
    return new Promise(function(resolve, reject) {
            var query = "SELECT COUNT(*) as totalLinks , (SELECT COUNT(*) FROM uniquelink as a   WHERE  isActive = '1' AND a.studyId = u.studyId ) as remainingLinks  FROM uniquelink as u  WHERE   studyId =   '" + SID + "';";
            queryWrapper.execute(query, [], function (result) {
            if (result.errno && result.errno !== undefined) {
                    data.result = false;
                    data.sendEmail = true;
                    resolve(data);
            } else {
                if(result.length > 0 && result[0]  != undefined) {
                    
                    let totalRemainingLinkss = result[0].remainingLinks;
                    let totalUsedLinkss = result[0].totalLinks -  result[0].remainingLinks;

                    if(totalRemainingLinkss > 0){
                       
                        if((totalUsedLinkss+totalRemainingLinkss) * 10 /100 < totalRemainingLinkss){
                            data.result = true;
                            data.sendEmail = false;
                            resolve(data);
                        } else {
                            data.result = true;
                            data.sendEmail = true;
                            resolve(data);
                        }


                    } else { 
                        data.result = false;
                        data.sendEmail = true;
                        resolve(data);
                    }
                } else {
                    data.result = false;
                    data.sendEmail = true;
                    resolve(data);
                } 
            }
            ;
            });
    });
}

module.exports= {
    checkUniqueLinkStatus : checkUniqueLinkStatus
}