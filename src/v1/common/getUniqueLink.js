
async function getUniqueLink(SID){
    var data = {};
    return new Promise(function(resolve, reject) {
            var query = "SELECT * FROM uniquelink WHERE 	studyId = '" + SID + "' AND isActive = '1' limit 1";
            queryWrapper.execute(query, [], function (result) {
            if (result.errno && result.errno !== undefined) {
                    data.result = false;
                    resolve(data);
            } else {
                if(result.length > 0 && result[0]  != undefined) {
                        data.result = true;
                        data.data = result[0];
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
    getUniqueLink : getUniqueLink
}