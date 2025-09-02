async function checkForGroupSecurity(userIpAddress, studyData){
    var data = {};
    return new Promise(function(resolve, reject) {
        if(studyData.isgroupsecurityactive === 1 || studyData.isgroupsecurityactive === true){

            var query = "SELECT * FROM participants as p left join studies as s on s._id = p.sid WHERE  s.groupsecurity = '"+studyData.groupsecurity+"' AND  p.participantIp = '" + userIpAddress + "' LIMIT 1";
            queryWrapper.execute(query, [], function (result) {
            if (result.errno && result.errno !== undefined) {
                    data.result = false;
                    resolve(data);
            } else {
                if(result.length > 0 && result[0]  != undefined) {
                    data.result = false;
                    resolve(data);
                } else {
                    data.result = true;
                    resolve(data);
                } 
            }
            ;
            });
        } else {
            data.result = true;
            resolve(data);
        }
    });
}

module.exports= {
    checkForGroupSecurity : checkForGroupSecurity
}