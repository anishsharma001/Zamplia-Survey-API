const getVendorById = require('../common/getVendorById');
async function constructVendorRedirect(VendorId, mappingData,SID,UID,vendorVar3,vendorData){

    let data = {};

    return new Promise(function(resolve, reject) {
    // complete url construction
            let completeUrl = mappingData.successUrl;
            if(!mappingData.successUrl.includes("?")){
               if(completeUrl.charAt(completeUrl.length-1) === "/"){
                completeUrl = completeUrl + "?";
               }else{
                completeUrl = completeUrl + "/?";
               }
            }

    // terminate url construction
            let terminateUrl = mappingData.terminateUrl;
            if(!mappingData.terminateUrl.includes("?")){
                if(terminateUrl.charAt(terminateUrl.length-1) === "/"){
                    terminateUrl = terminateUrl + "?";
                }else{
                    terminateUrl = terminateUrl + "/?";
                }
            }
    // overquota url construction
            let overQuotaUrl = mappingData.overQuotaUrl;
            if(!mappingData.overQuotaUrl.includes("?")){
                if(overQuotaUrl.charAt(overQuotaUrl.length-1) === "/"){
                    overQuotaUrl = overQuotaUrl + "?";
                }else{
                    overQuotaUrl = overQuotaUrl + "/?";
                }
            }

    // security url construction
            let securityTerminate = mappingData.securityTerminate;
            if(!mappingData.securityTerminate.includes("?")){
                if(securityTerminate.charAt(securityTerminate.length-1) === "/"){
                    securityTerminate = securityTerminate + "?";
                }else{
                    securityTerminate = securityTerminate + "/?";
                }
            }



            // add params
            if(vendorData.variable1){
                let completeAnd = completeUrl.indexOf("?");
                if(completeAnd === completeUrl.length-1){
                    completeUrl = completeUrl +vendorData.variable1+"="+SID;
                  }else if(completeAnd < completeUrl.length-1){
                    completeUrl = completeUrl +"&"+vendorData.variable1+"="+SID;
                  }


                let terminatAnd = terminateUrl.indexOf("?");
                  if(terminatAnd === terminateUrl.length-1){
                    terminateUrl =  terminateUrl +vendorData.variable1+"="+SID;
                  }else if(terminatAnd < terminateUrl.length-1 ){
                    terminateUrl =  terminateUrl  +"&"+vendorData.variable1+"="+SID;
                  }


                let overQuotaAnd = overQuotaUrl.indexOf("?");
                if(overQuotaAnd === overQuotaUrl.length-1){
                    overQuotaUrl =  overQuotaUrl +vendorData.variable1+"="+SID;
                }else if(overQuotaAnd < overQuotaUrl.length-1 ){
                    overQuotaUrl =  overQuotaUrl  +"&"+vendorData.variable1+"="+SID;
                }

                let securityAnd = securityTerminate.indexOf("?");
                if(securityAnd === securityTerminate.length-1){
                    securityTerminate =  securityTerminate +vendorData.variable1+"="+SID;
                }else if(securityAnd < securityTerminate.length-1 ){
                    securityTerminate =  securityTerminate  +"&"+vendorData.variable1+"="+SID;
                }      

            }


        // var2
        if(vendorData.variable2){
            completeUrl = completeUrl +"&"+vendorData.variable2+"="+UID;
            terminateUrl =  terminateUrl  +"&"+vendorData.variable2+"="+UID;
            overQuotaUrl = overQuotaUrl +"&"+vendorData.variable2+"="+UID;
            securityTerminate = securityTerminate +"&"+vendorData.variable2+"="+UID;
        }

        // var3

        if(vendorData.variable3){
            completeUrl = completeUrl +"&"+vendorData.variable3+"="+vendorVar3;
            terminateUrl =  terminateUrl  +"&"+vendorData.variable3+"="+vendorVar3;
            overQuotaUrl = overQuotaUrl +"&"+vendorData.variable3+"="+vendorVar3;
            securityTerminate = securityTerminate +"&"+vendorData.variable3+"="+vendorVar3;
        }
            


        if(vendorData.onSendVariableOne === "" || vendorData.onSendVariableOne === "0" || vendorData.onSendVariableOne === 0  || vendorData.onSendVariableOne === false){
            completeUrl  = completeUrl.replace(vendorData.variable1+"="+SID, "").replace("&&","&").replace("?&","?");
            terminateUrl  = terminateUrl.replace(vendorData.variable1+"="+SID, "").replace("&&","&").replace("?&","?");
            overQuotaUrl  = overQuotaUrl.replace(vendorData.variable1+"="+SID, "").replace("&&","&").replace("?&","?");
            securityTerminate  = securityTerminate.replace(vendorData.variable1+"="+SID, "").replace("&&","&").replace("?&","?");
       
        }
          
          if(VendorId === "2520196VENDOR1564076895935"){
            //   completeUrl
            completeUrl  = completeUrl.replace("?"+vendorData.variable2+"=", "");
            completeUrl  = completeUrl.replace(vendorData.variable2+"=", "");

            //   terminateUrl
            terminateUrl  = terminateUrl.replace("?"+vendorData.variable2+"=", "");
            terminateUrl  = terminateUrl.replace(vendorData.variable2+"=", "");

            //   overQuotaUrl
            overQuotaUrl  = overQuotaUrl.replace("?"+vendorData.variable2+"=", "");
            overQuotaUrl  = overQuotaUrl.replace(vendorData.variable2+"=", "");

            //   securityTerminate
            securityTerminate  = securityTerminate.replace("?"+vendorData.variable2+"=", "");
            securityTerminate  = securityTerminate.replace(vendorData.variable2+"=", "");
          }



        data.completeUrl = completeUrl;
        data.terminateUrl = terminateUrl;
        data.overQuotaUrl = overQuotaUrl;
        data.securityTerminate = securityTerminate;

        resolve(data);
    });
}
module.exports= {
    constructVendorRedirect : constructVendorRedirect
}