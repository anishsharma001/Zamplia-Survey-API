const axios = require('axios');
const {
  SurveyQualBaseUrl,
  SurveyQuotaBaseUrl,
  SurveyGroupBaseUrl
} = require('./url');
const {insertlogs} = require('./comman')
const fetch = require('node-fetch');
async function getQualificationFromApi(surveyId) {
    try {
        const getQualificationUrl = SurveyQualBaseUrl + surveyId;
        await new Promise(resolve => setTimeout(resolve, 200));
        const response = await fetch(getQualificationUrl);
        const data = await response.json();
        await insertlogs(data, response?.status || 200, surveyId);
        return data;
    } catch (error) {
        await insertlogs(error, 500, surveyId);
        return [];
    }
}

async function getQuotaFromMCQ(surveyId) {
    try {
        const MCQQuotaUrl = SurveyQuotaBaseUrl + surveyId;
        await new Promise(resolve => setTimeout(resolve, 200));
        const response = await fetch(MCQQuotaUrl);
        const data = await response.json();
        await insertlogs(data, 201, surveyId);
        return data;
    } catch (error) {
        await insertlogs(error, 501, surveyId);
        return [];
    }
}


async function getSurveyGroupFromMcq(surveyId) {
    try {
        const mcqGroupSurveyUrl = SurveyGroupBaseUrl + surveyId;
        const getGroupsSurveys = await axios.get(mcqGroupSurveyUrl, {});
        return getGroupsSurveys.data;
    } catch (error) {
        throw new Error(`Oops Something went wrong during ${error}, please contact to support!`)
    }
}

module.exports = { getQualificationFromApi, getQuotaFromMCQ, getSurveyGroupFromMcq }