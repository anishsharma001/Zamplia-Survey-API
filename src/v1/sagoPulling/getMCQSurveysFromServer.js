const axios = require('axios');
const mcqEndponts = require('./configs');
module.exports.getMCQSurveysFromServer = async function () {
  try {
    const url = mcqEndponts.GET_SURVEYS;
    const headers = {
      'Content-Type': 'application/json',
      // 'X-MC-SUPPLY-KEY': '1129:ed9044a5-ef26-4a3d-a6db-5d2d39e10b4e'
    };

    const response = await axios.get(url, { headers });

    let data = { success: false };

    if (response.status === 200 && response.data) {
      data.success = true;
      data.surveys = response.data.Surveys;
    }

    return data;
  } catch (error) {
    // log error if needed
    return { success: false };
  }
};


module.exports.getMCQBuyerIdFromServer = async function () {
  try {
    const url = mcqEndponts.GETBUYER_ID;
    const headers = {
      'Content-Type': 'application/json',
      'X-MC-SUPPLY-KEY': '1129:ed9044a5-ef26-4a3d-a6db-5d2d39e10b4e',
    };

    const response = await axios.get(url, { headers });

    if (response.status === 200) {
      return {
        success: true,
        surveys: response.data.Surveys,
      };
    } else {
      return {
        success: false,
      };
    }
  } catch (error) {
    console.error('Error occurred while fetching ', error.message);
    return {
      success: false,
    };
  }
};

module.exports.getMCQSurveyStatsFromServer = async function (surveyId) {
  try {
    const options = {
      method: 'GET',
      url: mcqEndponts.GETSURVEY_STATS + surveyId,
      headers: {
        'Content-Type': 'application/json',
        'X-MC-SUPPLY-KEY': '1129:ed9044a5-ef26-4a3d-a6db-5d2d39e10b4e',
      }
    }

    const response = await axios(options);

    if (response.status === 200) {
      return {
        success: true,
        surveys: response.data.SurveyStats,
      };
    } else {
      return {
        success: false,
      };
    }
  } catch (error) {
    console.error('Error occurred while fetching ', error.message);
    return {
      success: false,
    };
  }
};