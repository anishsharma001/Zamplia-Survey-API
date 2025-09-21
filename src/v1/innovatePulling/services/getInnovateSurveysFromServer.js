const axios = require('axios');
const upsertSurveyData = require('../dao/upsertSurveyData'); // adjust path if needed
const config = require('./config'); // adjust path if needed

module.exports.getInnovateSurveyFromServer = async function () {
  try {
    const response = await axios.get(
      `${config.INNOVATE_BASE_URL}/getAllocatedSurveys`,
      {
        params: {
          countryCode: 'US',
          languageCode: 'en'
        },
        headers: {
          'x-access-token': config.INNOVATE_X_ACCESS_KEY
        }
      }
    );

    return {
      success: true,
      surveys: response.data.result
    };
  } catch (err) {
    return { success: false }; // simple return in catch
  }
};

module.exports.getScreenerInfo = async function (id, langCode, zampliaDemos) {
  try {
    const response = await axios.get(
      `${config.INNOVATE_BASE_URL}/getSurveyTargeting/${id}`,
      {
        headers: {
          accept: 'application/json',
          'x-access-token': config.INNOVATE_X_ACCESS_KEY
        }
      }
    );

    const res = response.data;
    res.studyId = id;

    if (Array.isArray(res.result) && res.result.length > 0) {
      await upsertSurveyData.upsertSurveyScreener(id, res.result, langCode, zampliaDemos);
    }
    return; // simple return
  } catch (err) {
    return; // simple return in catch
  }
};

module.exports.getQuotaInfo = async function (id, langCode, zampliaDemos, allSurveyIds) {
  try {
    const response = await axios.get(
      `${config.INNOVATE_BASE_URL}/getQuotaForSurvey/${id}`,
      {
        headers: {
          accept: 'application/json',
          'x-access-token': config.INNOVATE_X_ACCESS_KEY
        }
      }
    );

    const res = response.data;
    if (Array.isArray(res.result) && res.result.length > 0) {
      await upsertSurveyData.upsertSurveyQuota(id, res.result, langCode, zampliaDemos, allSurveyIds);
    }
    return; // simple return
  } catch (err) {
    return; // simple return in catch
  }
};
