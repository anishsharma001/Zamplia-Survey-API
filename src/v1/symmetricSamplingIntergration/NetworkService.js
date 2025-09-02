const axios = require('axios');
const {baseUrl,key} = require('./common')

async function getAllSurveys() {
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${baseUrl}/api/v1/surveys`,
    headers: { 
      'accept': 'application/json', 
      'X-SUP-API-Key': `${key}`
    }
  };
try {
    const response = await axios.request(config);
    return { success: true, result: response.data };
  } catch (error) {
    return { success: false, result: [] };
  }
}

async function getSurveyQuals(id) {
  const config = {
    method: 'get',
    url: `${baseUrl}/api/v1/survey-qualifications/${id}`,
    headers: { 
      'accept': 'application/json', 
      'X-SUP-API-Key': `${key}`
    }
  };
 try {
    const response = await axios.request(config);
    return { success: true, result: response.data.Qualifications };
  } catch (error) {
    return { success: false, result: [] };
  }
}

async function getSurveyQuata(id) {
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${baseUrl}/api/v1/survey-quotas/${id}`,
    headers: { 
      'accept': 'application/json', 
      'X-SUP-API-Key': `${key}`
    }
  };
 try {
    const response = await axios.request(config);
    return { success: true, result: response.data.Quotas };
  } catch (error) {
    return { success: false, result: [] };
  }
}

module.exports = {
  getAllSurveys,getSurveyQuals,getSurveyQuata
};
