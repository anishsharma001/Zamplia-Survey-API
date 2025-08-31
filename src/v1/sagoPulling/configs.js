
const GET_SURVEYS = "http://api.sample-cube.com/api/Survey/GetSupplierAllocatedSurveys/1129/ed9044a5-ef26-4a3d-a6db-5d2d39e10b4e";
const GETBUYER_ID = "https://api.sample-cube.com/api/v2/survey/supplier-surveys";
const GETSURVEY_STATS = " https://api.sample-cube.com/api/v2/survey/survey-stats/"


module.exports = {
    GET_SURVEYS : GET_SURVEYS,
    GETBUYER_ID : GETBUYER_ID,
    GETSURVEY_STATS,
    SURVEYS_FROM_STUDIES: { key: 'surveysFromStudies', expiry: 3 },
};