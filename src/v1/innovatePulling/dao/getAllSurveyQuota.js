const { executeDev7 } = require('../../../database/queryWrapperMysql');

async function getAllSurveyQuota(allSurveyIds) {
  try {
    // Prepare the list of survey IDs
    const formattedIds = allSurveyIds.map(value => `'INN${value}'`).join(",");

    const query = `
      SELECT id AS quotaId, studyId, lang_code, sqid, clientQuotaId
      FROM constrainsts
      WHERE studyId IN (${formattedIds})
    `;

    // Execute query
    const responseData = await executeDev7(query, []);

    // Return results or empty array
    if (responseData.errno && responseData.errno !== undefined) {
      return [];
    }

    return responseData.length > 0 ? responseData : [];
  } catch (error) {
    console.error('Error fetching survey quotas:', error);
    return [];
  }
}

module.exports = { getAllSurveyQuota };
