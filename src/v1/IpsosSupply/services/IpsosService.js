const { GET_SURVEYS, GET_QUOTAS, GET_QUESTIONS } = require("../utils/config");
const { getIpsosToken } = require('../utils/IpsosToken');
const axios = require('axios');
const {insertlogs} = require('../model/ipsosModel');
let token;

/**
 * Initialize the token.
 */
async function initializeToken() {
    try {
       
        token = await getIpsosToken();
        if (token.success === false) {
            throw new Error("Failed to retrieve token");
        }
    } catch (error) {
        console.error("Error initializing token:", error.message);
        throw new Error("Error initializing token");
    }
}

/**
 * Generate headers for API requests.
 * @param {string} token - The authorization token.
 * @return {object} - The headers object.
 */
function generateHeader(token) {
    return {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
}

/**
 * Get all surveys based on the language code.
 * @param {string} lang_code - The language code to filter surveys by.
 * @return {Promise<object[]>} - A promise that resolves to an array of surveys.
 */
async function getIpsosAllSurveys(lang_code) {
    try {
        await initializeToken();
        const options = generateHeader(token?.accessToken);
        const response = await axios.post(GET_SURVEYS, {}, options);
        const data = response.data;
        if (Array.isArray(data)) {
           return data.filter(item => item.locales.some(locale => locale.name === lang_code) && item.collectPII === false && item.expectedClientLoi <= 40 && item.expectedIncidenceRate >= 10);
        } else {
            return [];
        }
    } catch (error) {
        throw new Error(`Error fetching Ipsos surveys: ${error.message}`);
    }
}

/**
 * Fetches quota data from the API for a given survey.
 * @param {number} surveyId - The ID of the survey.
 * @returns {Promise<object[]>} - A promise that resolves to an array of quota data.
 */
async function getQuotaFromApi(surveyId) {
    try {
        await initializeToken();
        const getQualificationUrl = `${GET_QUOTAS}${surveyId}/quotas`;
        const options = generateHeader(token?.accessToken);
        const qualificationResult = await axios.get(getQualificationUrl, options);
        // await insertlogs(qualificationResult.data, 200, surveyId, 17);
        return qualificationResult.data;
    } catch (error) {
        await insertlogs(error,  500, surveyId, 17);
        console.error(`Error fetching quotas for survey ${surveyId}:`, error.message);
        return [];
    }
}

/**
 * Fetches qualification data from the API.
 * @returns {Promise<object[]>} - A promise that resolves to an array of qualification data.
 */
async function getQualificationFromApi() {
    try {
        const qualificationResult = await axios.get(GET_QUESTIONS, options);
        return qualificationResult.data;
    } catch (error) {
        console.error("Error fetching qualification data:", error.message);
        return [];
    }
}


module.exports = { getIpsosAllSurveys, getQualificationFromApi, getQuotaFromApi };
