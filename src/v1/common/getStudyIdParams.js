function getStudyIdParams(postData, vendorData){
   
    let SID  = "";
    let UID = "";
    let vendorVar3 = "";

    let data = {};
    for(let i=0; i< postData.length; i++){
        if(postData[i][0] == vendorData.variable1){
            SID = postData[i][1];
        }

        if(postData[i][0] == vendorData.variable2){
            UID = postData[i][1];
        }

        if(postData[i][0] == vendorData.variable3){
            vendorVar3 = postData[i][1];
        }
    }
    
    data.SID = SID;
    data.UID = UID;
    data.vendorVar3 = vendorVar3;
    return data;
}
module.exports= {
    getStudyIdParams : getStudyIdParams
}