const { getVendorData, upsertStudyDemoDb,pauseQualficationNotMatchSurvey , pauseUnAvailableQuotas, upsertDemoAgeIntoDb,getAllInsertedQuotas , insertQuotaDemoIntoDb, InsertQuotaDataIntoDb } = require('./model/lucidmodel');
const { VendorIdForMapping } = require('./utils/common');
const {getQualificationFromApi, getQuotaFromLucid} = require('./services/lucidServices');


/**
 * 
 * @param {Array} data  of all surveys array of object
 * @returns return response if operation successful then true otherwise false
 */

async function createSuveyBundle( data , lang_code ){
    let surveyDataBundle = [];
    let surveyDataBundleAllocation = [];
    let surveyIds = [];
    let BulkSurveyData = [];
    let BulkSurveyAllocationData = [];
    let status = "Live"
    for(let surveyIndex of data){
      var surveyEndDate = new Date();
        surveyIndex.status = 'Live';
        surveyEndDate.setDate(surveyEndDate.getDate() + 15);
        let studyId = `LD${surveyIndex.SurveyNumber}`
        surveyIds.push([surveyIndex.SurveyNumber]);
      if(surveyIndex.BidLengthOfInterview <= 25 && surveyIndex.BidIncidence > 15  ){
        
        if(surveyIndex.isAllowSurvey == 0 && surveyIndex.RPI && surveyIndex.RPI.value !== undefined){
          
          surveyDataBundle.push(
              [
                studyId,
                surveyIndex.SurveyName.substring(0, 50), surveyIndex.SurveyName,
                surveyIndex.TotalRemaining,
                null,
                null,
                parseFloat(surveyIndex.RPI && surveyIndex.RPI.value !== undefined ? surveyIndex.RPI.value : 0).toFixed(2),
                "Live",
                surveyIndex.BidLengthOfInterview == 0 ? 1 : surveyIndex.BidLengthOfInterview, 
                surveyIndex.BidIncidence == 0 ? 10 : surveyIndex.BidIncidence,
                1, 1, lang_code,lang_code, 10,10,
                surveyIndex.SurveyNumber,
                surveyEndDate,
                'Both', 1, surveyIndex.SurveyGroupExists, 0, surveyIndex.CollectsPII,"ADHOC",
                0,100,4,surveyIndex.IndustryID || 30,surveyIndex.AccountName,surveyIndex.Conversion,0
              ]
          );
          // BulkSurveyData.push([
          //   surveyIndex.AccountName,
          //   surveyIndex.BidIncidence,
          //   surveyIndex.BidLengthOfInterview,
          //   surveyIndex.CPI,
          //   surveyIndex.CollectsPII,
          //   surveyIndex.CompletionPercentage,
          //   surveyIndex.Conversion,
          //   surveyIndex.CountryLanguageID,
          //   surveyIndex.FieldEndDate,
          //   surveyIndex.IndustryID,
          //   surveyIndex.IsOnlySupplierInGroup,
          //   surveyIndex.IsTrueSample,
          //   surveyIndex.LengthOfInterview,
          //   surveyIndex.OverallCompletes,
          //   surveyIndex.SampleTypeID,
          //   surveyIndex.StudyTypeID,
          //   surveyIndex.SurveyGroup,
          //   surveyIndex.SurveyGroupExists,
          //   surveyIndex.SurveyGroupID,
          //   surveyIndex.SurveyMobileConversion,
          //   surveyIndex.SurveyName,
          //   surveyIndex.SurveyNumber,
          //   surveyIndex.SurveyQuotaCalcTypeID,
          //   surveyIndex.SurveySID,
          //   surveyIndex.TerminationLengthOfInterview,
          //   surveyIndex.TotalRemaining,
          //   status
          // ]);
        }else{
          surveyDataBundleAllocation.push(
            [
              studyId,
              surveyIndex.SurveyName.substring(0, 50), surveyIndex.SurveyName,
              "Live",
              surveyIndex.BidLengthOfInterview == 0 ? 1 : surveyIndex.BidLengthOfInterview, 
              surveyIndex.BidIncidence,
              1, 1, lang_code,lang_code, 10,10,
              surveyIndex.SurveyNumber,
              surveyEndDate,
              'Both', 1, surveyIndex.SurveyGroupExists, 0, surveyIndex.CollectsPII,"ADHOC",
              0,100,4,surveyIndex.IndustryID || 30,surveyIndex.AccountName,surveyIndex.Conversion
            ]
          );
          // BulkSurveyAllocationData.push([surveyIndex.AccountName,
          //   surveyIndex.BidIncidence,
          //   surveyIndex.BidLengthOfInterview,
          //   surveyIndex.CollectsPII,
          //   surveyIndex.Conversion,
          //   surveyIndex.CountryLanguageID,
          //   surveyIndex.FieldBeginDate,
          //   surveyIndex.FieldEndDate,
          //   surveyIndex.IndustryID,
          //   surveyIndex.IsTrueSample,
          //   surveyIndex.LengthOfInterview,
          //   surveyIndex.Priority,
          //   surveyIndex.SampleTypeID,
          //   surveyIndex.StudyTypeID,
          //   surveyIndex.SurveyGroup,
          //   surveyIndex.SurveyGroupExists,
          //   surveyIndex.SurveyGroupID,
          //   surveyIndex.SurveyMobileConversion,
          //   surveyIndex.SurveyName,
          //   surveyIndex.SurveyNumber,
          //   surveyIndex.SurveyQuotaCalcTypeID,
          //   surveyIndex.SurveySID,
          //   surveyIndex.TerminationLengthOfInterview,
          //   status]
          // );
        }
      }
    }
    return [surveyDataBundle, surveyDataBundleAllocation, surveyIds, BulkSurveyData, BulkSurveyAllocationData];
}

/**
 * Creates a mapping data bundle for survey and vendor data.
 * @param {Array} surveyData - The survey data array.
 * @returns {Promise<Array>} The mapping data bundle.
 * @throws {Error} If an error occurs during vendor mapping creation.
 */
 async function createAllVendorDataBundle(surveyData) {
    try {
      const vendorDataForMapping = await getVendorData(VendorIdForMapping);
      const allVendorData = vendorDataForMapping.result;
      const vendorDataBundle = [];
  
      for (const vendorIndex of allVendorData) {
        const vendorData = await createMappingDataBundle(surveyData, vendorIndex);
        // vendorIndex._id == '2420201VENDOR1582554920786' 
        // ? await createMappingDataBundle(surveyData.filter((x) => x.CPI >= 2), vendorIndex) 
        //  await createMappingDataBundle(surveyData, vendorIndex);
        vendorDataBundle.push(...vendorData);
      }

      return vendorDataBundle;
    } catch (error) {
      throw new Error("Oops something went wrong during vendor mapping creation!");
    }
  }
  
  /**
   * Creates a mapping data bundle for survey and vendor data.
   * @param {Array} surveyData - The survey data array.
   * @param {Object} vendorData - The vendor data object.
   * @returns {Promise<Array>} The mapping data bundle.
   * @throws {Error} If no data is found for vendor data.
   */
  async function createMappingDataBundle(surveyData, vendorData) {
    const mappingDataBundle = [];
  
    for (const surveyIndex of surveyData) {
      const studyId = `LD${surveyIndex.SurveyNumber}`;
      const newIDMapId = `${getCurrentDate()}Map${studyId}`;
      const vendorId = vendorData._id;
      const date = new Date();
      const totalQuota = 100; // By default
      const vendorSuccessUrl = await replaceQuotaId(vendorData.redirectUrlSuccess, studyId);
      const vendorTerminateUrl = await replaceQuotaId(vendorData.redirectUrlTerminated, studyId);
      const vendorOverQuotaUrl = await replaceQuotaId(vendorData.redirectUrlOverQuota, studyId);
      const vendorSecurityUrl = await replaceQuotaId(vendorData.redirectUrlSecurityTermination, studyId);
  
      mappingDataBundle.push([
        studyId + vendorId,
        studyId,
        vendorId,
        newIDMapId,
        vendorSuccessUrl,
        vendorTerminateUrl,
        vendorOverQuotaUrl,
        vendorSecurityUrl,
        "",
        "",
        date,
        date,
        surveyIndex.TotalRemaining,
        totalQuota
      ]);
    }
  
    return mappingDataBundle;
  }
  
  /**
   * Replaces the quota ID in the given URL.
   * @param {string} url - The URL string.
   * @param {string} quotaId - The quota ID to replace.
   * @returns {Promise<string>} The updated URL string.
   */
  async function replaceQuotaId(url, quotaId) {
    return String(url).replace("<quotaId>", quotaId);
  }
  async function batchPromises(promises, batchSize) {
    const results = [];
  
    for (let i = 0; i < promises.length; i += batchSize) {
      const batch = promises.slice(i, i + batchSize);
      await new Promise(r => setTimeout(r, 200));
      const batchResults = await Promise.all(batch.map((promise) => promise));
      results.push(...batchResults);
    }
  
    return results;
  }
  /**
   * Gets the current date in the required format.
   * @returns {string} The current date string.
   */
  function getCurrentDate() {
    const d = new Date();
    const dateNow = d.getDate();
    const month = d.getMonth();
    const yearNow = d.getFullYear();
    const milliseconds = d.getMilliseconds().toString().substring(0, 7);
    return `${dateNow}${yearNow}${month}${milliseconds}`;
  }


module.exports = { createSuveyBundle, createAllVendorDataBundle , batchPromises }