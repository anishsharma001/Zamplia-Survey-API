const getIp = require('../../Utility/getRequestedIpAddress');
const getMaxmind = require('../../Utility/getMaxminScoreByIpAddress');

async function validateMaxmindOnStudy(req, studyData){
    var data = {};
    data.maxmindObtainedByUser = 0;
    data.isMaxmindPassed = true;
    const userIPAddress = await getIp.getRequestedIpAddress(req);
    if(studyData.isMaxmind){
      const maxmindObtained = await getMaxmind.getMaxminScoreByIpAddress(userIPAddress);
       if(maxmindObtained < 0){
        data.isMaxmindPassed = false;
        data.maxmindObtainedByUser = 0;
       } else {
           if(parseInt(maxmindObtained) <= parseInt(studyData.maxmindscore)){
            data.isMaxmindPassed = true;
           } else {
            data.isMaxmindPassed = false;
           }
       }
     } else {
        data.maxmindObtainedByUser = 0;
     }
     data.userIPAddress = userIPAddress;

     return data;
}

module.exports= {
    validateMaxmindOnStudy : validateMaxmindOnStudy
}