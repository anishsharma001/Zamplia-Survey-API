const { executeDev7 } = require('../../../database/queryWrapperMysql');

module.exports.updateAllSurveyStatus = async function (allSurveys, apiClientId) {
  try {
    const query = `
      UPDATE studies 
      SET status = 'On Hold', isActive = 0 
      WHERE apiSurveyId IN (?) 
        AND apiClientId = ? 
        AND isActive = 1
    `;

    const result = await executeDev7(query, [allSurveys, apiClientId]);
    return result;

  } catch (error) {
    return {
      success: false,
      message: `Error while updating survey status: ${error.message}`
    };
  }
};

