const axios = require('axios');

 async function PauseSyncOnVendorApis(studyId){
    try{
       const baseUrl = "https://zampliabackend.azurewebsites.net/api/";
         const data ={
            studyId,
            type: "pause"
         };
         const url = `${baseUrl}syncStudiesOnVendor`;
        const response = await axios.post(url, data);
        return response.data;
    }catch(error){
        throw new Error("Oops! something went wrong, please contact to support!", error.message);
    }
 }
 module.exports={PauseSyncOnVendorApis}