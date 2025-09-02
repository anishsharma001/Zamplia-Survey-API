

/**
 * @param {Array} data  of all surveys array of object
 * @returns return response if operation successful then true otherwise false
 */

async function createIpsosSurveyBundle(data, lang_code) {
    let surveyBundleData = [];
    let surveyIds = [];

    for (let surveyIndex of data) {
        // if(surveyIndex.remaining < 10){
        //     continue;
        // }
        var surveyEndDate = new Date();
        surveyEndDate.setDate(surveyEndDate.getDate() + 15);
        let studyId = `IPSOS${surveyIndex.subsampleId}`
        surveyIds.push([surveyIndex.subsampleId]);
        let deviceType = surveyIndex.allowDesktop && surveyIndex.allowMobile ? "Both" : surveyIndex.allowMobile && surveyIndex.allowTablet ? "Mobile" : surveyIndex.allowTablet && surveyIndex.allowDesktop ? "Desktop" : surveyIndex.allowDesktop ? "Desktop" : surveyIndex.allowMobile ? "Mobile" : surveyIndex.allowTablet ? "Mobile" : "";
        // let groupSecurity = surveyIndex['exclusion-group']
        // INSERT INTO studies ( _id, studyName, description, orignalRequirment, firstPartyUrl, 
        //   firstPartyUrlTest, fees, status, loi, ir, isActive,  apiType, country, lang_code, 
        //   apiClientId, client, apiSurveyId,surveyEndDate, device, isCountryCheck, 
        //   isgroupsecurityactive, allowDemo, isPIIActive, studytypes, isSampleChainReview, 
        //   vendorSharedQuota, clientType, categoryId) 
        surveyBundleData.push(
            [
                studyId,
                surveyIndex.eventName.substring(0, 50),
                surveyIndex.eventName,
                0,
                surveyIndex.locales[0].liveEntryLink,
                surveyIndex.locales[0].testingEntryLink,
                (surveyIndex.targetedCPI),
                "Live",
                surveyIndex.expectedClientLoi,
                surveyIndex.expectedIncidenceRate,
                1, 1, lang_code, lang_code, 17, 17,
                surveyIndex.subsampleId,
                surveyEndDate,
                `${deviceType}`, 1, 0, 0, 0, "ADHOC",
                0, 100, 4, 30,0,9999
            ]
        );
    }
    return [surveyBundleData, surveyIds];
}


async function batchPromises(promises, batchSize) {
    const results = [];
  
    for (let i = 0; i < promises.length; i += batchSize) {
      const batch = promises.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map((promise) => promise));
      results.push(...batchResults);
    }
  
    return results;
  }

  async function createmapingBundle(study, vendorData, requirement){
    try{
        
        let d = new Date();
        let timeNow = d.getTime();
        let dateNow = d.getDate();
        let month = d.getMonth();
        let yearNow = d.getFullYear();
        let newIDMAPING = "" + dateNow + yearNow + month + "Map" + timeNow  + "";
        let mappingData = [];
         mappingData.push([
            newIDMAPING,
            study[0] + vendorData[0]._id,
            study[0],
            vendorData[0]._id,
            vendorData[0].redirectUrlSuccess,
            vendorData[0].redirectUrlTerminated,
            vendorData[0].redirectUrlOverQuota,
            vendorData[0].redirectUrlSecurityTermination,
            study[4],
            study[4],
            d, d, 100,
            requirement ,
            vendorData[0].vendorCpi , "",
            study[6], 0, 0, vendorData[0].vendorCpi,
            study[6], 0
        ]);
    
        // await upsertMappingData(mappingData); 
        return mappingData;
    }catch(error){
        throw new Error("Oops! something went wrong, please contact to support!", error.message);
    }
     

}


module.exports = { createIpsosSurveyBundle,batchPromises, createmapingBundle }