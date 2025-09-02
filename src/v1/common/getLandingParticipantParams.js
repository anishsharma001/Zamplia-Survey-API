function getLandingParticipantParams(postData){
   
    let VendorId  = "";
    let isParticipantRouter = 0;
    let isNoSidUser = 0;
    let participantLandingURL = "";
    let originParticipant = "";

    let data = {};
    for(let i=0; i< postData.length; i++){
        if(postData[i][0] == "vid" ){
            VendorId = postData[i][1];
        }

        if(postData[i][0] == "isParticipantRouter" ){
            isParticipantRouter = 1;
        }

        if(postData[i][0] == "originParticipant" ){
            originParticipant = postData[i][1];
        }

        if(postData[i][0] == "participantLandingURL" ){
            participantLandingURL = postData[i][1];
            participantLandingURL = "https://"+participantLandingURL;
        }
        
        if(postData[i][0] == "isNoSidUser" ){
            isNoSidUser = 1;
        }
    }
    
    data.VendorId = VendorId;
    data.isParticipantRouter = isParticipantRouter;
    data.isNoSidUser = isNoSidUser;
    data.participantLandingURL = participantLandingURL;
    data.originParticipant = originParticipant;

    return data;
}
module.exports= {
    getLandingParticipantParams : getLandingParticipantParams
}