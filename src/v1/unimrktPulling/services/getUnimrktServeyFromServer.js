const config = require('./config.js');
const axios = require('axios');
const upsertSurveyData = require('../dao/upsertSurveyData.js')

module.exports.getUnimrktServeyFromServer = async function () {
  try {
    const response = await axios.get(config.UNIMRKT_BASE_URL, {
      headers: {
        accept: 'application/json',
        'x-access-key': config.UNIMRKT_X_ACCESS_KEY,
      },
    });

    if (response.status === 200 && response.data) {
      return {
        success: true,
        surveys: response.data.surveys,
      };
    }

    return { success: false };

  } catch (error) {
    console.error('Error fetching Unimrkt surveys:', error.message || error);
    return { success: false };
  }
};

module.exports.getScreenerInfo = async function (id) {
    try {
        const options = {
            method: 'GET',
            url: `${config.UNIMRKT_BASE_URL}/${id}/questions`,
            headers: {
                'accept': 'application/json',
                'x-access-key': config.UNIMRKT_X_ACCESS_KEY,
            }
        };

        const response = await axios(options);
        if (response.status === 200) {
            return response.data;
        } else {
            return (`Request failed with status: ${response.status}`);
        }
    } catch (error) {
        return error;
    }
};

module.exports.getQuotaInfo = async function (id) {

    try {
        const options = {
            method: 'GET',
            url: `${config.UNIMRKT_BASE_URL}/${id}/quotas`,
            headers: {
                accept: 'application/json',
                'x-access-key': config.UNIMRKT_X_ACCESS_KEY,
            }
        };

        const response = await axios(options);
        if (response.status === 200) {
            const res = response.data;
            return response.data;
        } else {
            return (`Request failed with status: ${response.status}`);
        }
    } catch (error) {
        return error;
    }
};

module.exports.getGroupInfo = async function (id, langCode) {
  try {
    const response = await axios.get(`${config.UNIMRKT_BASE_URL}/${id}/groups`, {
      headers: {
        accept: 'application/json',
        'x-access-key': config.UNIMRKT_X_ACCESS_KEY,
      },
    });

    if (response.status === 200 && response.data) {
      await upsertSurveyData.upsertSurveyGroup(id, response.data.groups, langCode);
    }
  } catch (error) {
    console.error(`Error fetching group info for survey ${id}:`, error.message || error);
  }
};

module.exports.getUnimarktStat = async function (surveyId){
    try{
        
        let configs = {
        method: 'GET',
        maxBodyLength: Infinity,
        url: `${config.UNIMRKT_BASE_URL}/${surveyId}/stats`,
        headers: { 
            'accept': 'application/json', 
            'x-access-key': `${config.UNIMRKT_X_ACCESS_KEY}`,
        }
        };
        
        const result = await axios.request(configs);
        return result.data;
    }catch(error){
        return ("Something went wrong!")
    }
    
}
