/* getStudyById Will return the result in true or false. 
*  If record found, then TRUE
*  If record not found, then FALSE
*/ 
async function getStudyById(studyId){
    var isAvailable = [];
    var data = {};
    return new Promise(function(resolve, reject) {
            var query = "SELECT * FROM studies WHERE _id = '" + studyId + "' AND isActive = 1";
            queryWrapper.execute(query, [], function (result) {
            if (result.errno && result.errno !== undefined) {
                data.result = false;
                isAvailable.push(data);
            } else {
                if(result.length > 0) {
                    if(result[0].status === "Live"){
                        data.result = true;
                        data.studyData = result[0];
                        isAvailable.push(data);
                    } else {
                        data.result = false;
                        isAvailable.push(data);
                    }
                } else {
                    data.result = false;
                    isAvailable.push(data);
                } 
            }
            resolve(isAvailable);
            });
    });
}

module.exports= {
    getStudyById : getStudyById
}