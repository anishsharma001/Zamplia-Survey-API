var appConstants = require('../../common/appConstants');
const cachingService = require('../../common/cachingService');
const cacheKeys = cachingService.cacheKeys;

module.exports.getAllApiSurveyFromDbStudies = async function (country, apiClientType) {
    // Do async job
    var query = "";
    var paramsData;
    let allSurveys; //[]
    if (apiClientType === appConstants.IPSOS_SURVEY_TYPE_ID || apiClientType === appConstants.MCQ_SURVEY_TYPE_ID || apiClientType === appConstants.Unimrkt_SURVEY_TYPE_ID || apiClientType === appConstants.Elicit_SURVEY_TYPE_ID || apiClientType === appConstants.INNOVATE_SURVEY_TYPE_ID) {
        query = `select apiSurveyId from studies where apiClientId = ? AND isActive = 1 AND status ='Live'`;
        paramsData = [apiClientType]
        allSurveys = await cachingService.getAllSurveyFromDbStudies(cacheKeys.SURVEYS_FROM_STUDIES, query, { apiClientType }, {apiClientType});
    } else {
        query = `select apiSurveyId from studies where country = ? AND apiClientId = ? AND isActive = 1 AND status = 'Live'`;
        paramsData = [country, apiClientType]
        allSurveys = await cachingService.getAllSurveyFromDbStudies(cacheKeys.SURVEYS_FROM_STUDIES, query, { country, apiClientType },  {country, apiClientType});
    }
    console.log("allSurveys", allSurveys);
    return allSurveys;
}