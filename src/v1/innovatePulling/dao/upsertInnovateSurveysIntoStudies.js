// const dbQueries = require('../common/dbQueries');
const { executeDev7 } = require('../../../database/queryWrapperMysql');

module.exports.upsertSurveysIntoStudies = async function (allSurveysToUpsert) {
  try {
    // Deep copy to avoid mutating original array
    let data = JSON.parse(JSON.stringify(allSurveysToUpsert));
    // Remove last element from each inner array
    data.forEach(d => d.pop());

    // Build the query
    const query = `
      INSERT INTO studies (
        _id, studyName, description, orignalRequirment, firstPartyUrl, firstPartyUrlTest,
        fees, status, loi, ir, isActive, apiType, country, apiClientId, apiSurveyId,
        surveyEndDate, device, isCountryCheck, EPC, isgroupsecurityactive, clientSurveyGUID,
        allowDemo, isPIIActive, lang_code, client, vendorSharedQuota, isSampleChainReview,
        categoryId, isRouterEligible
      ) VALUES ?
      ON DUPLICATE KEY UPDATE
        firstPartyUrl = VALUES(firstPartyUrl),
        firstPartyUrlTest = VALUES(firstPartyUrlTest),
        fees = VALUES(fees),
        loi = VALUES(loi),
        ir = VALUES(ir),
        updatedAt = VALUES(updatedAt),
        status = VALUES(status),
        isActive = VALUES(isActive),
        device = VALUES(device),
        EPC = VALUES(EPC),
        clientSurveyGUID = VALUES(clientSurveyGUID),
        allowDemo = VALUES(allowDemo),
        isPIIActive = VALUES(isPIIActive),
        lang_code = VALUES(lang_code),
        vendorSharedQuota = VALUES(vendorSharedQuota),
        surveyEndDate = VALUES(surveyEndDate),
        country = VALUES(country),
        categoryId = VALUES(categoryId),
        isRouterEligible = VALUES(isRouterEligible)
    `;

    // Execute query using executeDev7
    const result = await executeDev7(query, [data]);

    // Return consistent success/failure object
    if (result.errno && result.errno !== undefined) {
      return {
        success: false,
        message: result
      };
    } else {
      return {
        success: true,
        message: result
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Error while upserting surveys: ${error.message}`
    };
  }
};
