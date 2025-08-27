const axios = require('axios');
const { lucidSupplyLogs } = require('../lucidLogs')
const {baseUrl, supplierCode, collectsPII, surveyQuotaCalcTypeID,
PURE_BASE_URL, PURE_KEY, PURE_CREATESURVEY, groupSurveyUrl, Authorization , bidLengthOfInterviewLTE ,surveyQualUrl , QuotaUrl } = require('../utils/common');
const {insertlogs} = require('../model/lucidmodel')
// global header set 
const headers = {
    'Authorization': Authorization
};
/**
 get All survey based on the country id
 * @param {number} countryLanguageID 
 * @return {Promise}  
 */
async function getLucidAllSurveys(countryLanguageID, CPIGTE, CPILTE, LengthOfInterviewLTE, ConversionGTE, OverallCompletesGTE, TerminationLengthOfInterviewLTE) {
    try {
        const url = `${baseUrl}?CountryLanguageID=${countryLanguageID}&SupplierCode=${supplierCode}&CollectsPII=${collectsPII}`;
        let surveyUrl = `https://api.samplicio.us/Supply/v1/Surveys/AllOfferwall/ByCountryLanguage/${countryLanguageID}/${supplierCode}`;

        //&CPIGTE=${CPIGTE}&CPILTE=${CPILTE}&LengthOfInterviewLTE=${LengthOfInterviewLTE}&ConversionGTE=${ConversionGTE}&SurveyQuotaCalcTypeID=${surveyQuotaCalcTypeID}&OverallCompletesGTE=${OverallCompletesGTE}&TerminationLengthOfInterviewLTE=${TerminationLengthOfInterviewLTE}
        const response = await axios.get( surveyUrl, { headers } );
        const data = response.data;
        // lucidSupplyLogs(JSON.stringify(response.config.url), data.Surveys.length ? JSON.stringify(data.Surveys) : "no data found!", 'lucid-services-logs', data.Surveys ? data.Surveys.length : 0);
        if(data.ResultCount && data.hasOwnProperty("Surveys")){
            return data ;
        }else{
           return [];
        }
    } catch ( error ) {
        throw new Error({ success : false,  message : error.message || "Oops Something went wrong during get lucid surveys!" })
    }
  }

  /**
 * Fetches qualification data from the API for a given survey.
 * @param {number} surveyId - The ID of the survey.
 * @returns {Promise<object>} The qualification data.
 * @throws {Error} If an error occurs during the API request.
 */
  async function getQualificationFromApi( surveyId ) {
    try{
        const getQualificationUrl = surveyQualUrl + surveyId;
        const qualificationResult = await axios.get( getQualificationUrl , { headers })
         return qualificationResult.data;
    }catch( error ){
      insertlogs(error,501,surveyId,10)
      return [];
    }
  }

  /**
 * Fetches quota data from Lucid for a given survey.
 * @param {number} surveyId - The ID of the survey.
 * @returns {Promise<object>} The quota data.
 * @throws {Error} If an error occurs during the request.
 */
  async function getQuotaFromLucid( surveyId ){
    try {
        const LucidQuotaUrl = QuotaUrl + surveyId + "/" + supplierCode;
        const getQuotas = await axios.get(LucidQuotaUrl , { headers});
        return getQuotas.data;
    }catch(error){
        insertlogs(error,500,surveyId,10)
        return {ResultCount : 0}
    }
  }

  /**
 * Retrieves survey group data from Lucid.
 * @param {string} surveyId - The survey ID.
 * @returns {Promise<Object>} - The survey group data.
 * @throws {Error} - If an error occurs during the API call.
 */
  async function getSurveyGroupFromLucid( surveyId ){
    return new Promise(async (resolve,reject)=>{
      try{
        const lucidGroupSurveyUrl = groupSurveyUrl + surveyId +"/"+supplierCode;
        const getGroupsSurveys = await axios.get( lucidGroupSurveyUrl, {headers});
        resolve({...getGroupsSurveys.data,surveyId});
    }catch(error){
        reject(`Oops Something went wrong during ${error}, please contact to support!`)
    }
    })
  }

  /**
 * Update the project status for a survey.
 * @param {string} surveyId - The ID of the survey.
 * @param {string} status - The new status of the project.
 * @returns {Promise<Object>} A promise that resolves to an object containing the success status and response data.
 */
async function updateProjectStatus(surveyId, status) {
    const body = {
      ps_survey_status: status,
    };
  
    try {
      const response = await axios.put(`${PURE_BASE_URL}${PURE_CREATESURVEY}/${surveyId}/status`, body, {
        headers: {
          'access-token': PURE_KEY,
          'Content-Type': 'application/json',
        },
      });
  
      return {
        success: true,
        response: response.data,
      };
    } catch (error) {
      return {
        success: false,
        response: error.response ? error.response.data : error.message,
      };
    }
  }


  async function getAllAllocatedSurveys(lang_Code){
    try {
      let surveyUrl = `https://api.samplicio.us/Supply/v1/Surveys/SupplierAllocations/ByCountryLanguage/${lang_Code}/${supplierCode}`;

      const response = await axios.get( surveyUrl, { headers } );
      const data = response.data;
      // lucidSupplyLogs(JSON.stringify(response.config.url), data.SupplierAllocationSurveys.length ? JSON.stringify(data.SupplierAllocationSurveys) : "no data found!", 'lucid-services-logs', data.SupplierAllocationSurveys ? data.SupplierAllocationSurveys.length : 0);
      if(data.ResultCount && data.hasOwnProperty("SupplierAllocationSurveys")){
          return data.SupplierAllocationSurveys ;
      }else{
          return []
      }
    } catch ( error ) {
        throw new Error({ success : false,  message : error.message || "Oops Something went wrong during get lucid surveys!" })
    }
  }
   async function getallAiCategories(){
    try {
      let surveyUrl = `https://ai-router-hzb8cyawb2a7fnar.canadacentral-01.azurewebsites.net/category_router/create_study_category/10`;

      const response = await axios.get( surveyUrl, { headers: { "Content-Type": "application/json" } } );
      return [];
    } catch ( error ) {
        throw new Error({ success : false,  message : error.message || "Oops Something went wrong during get lucid surveys!" })
    }
  }


module.exports = {getLucidAllSurveys , updateProjectStatus,getAllAllocatedSurveys, getSurveyGroupFromLucid , getQualificationFromApi, getQuotaFromLucid,getallAiCategories}