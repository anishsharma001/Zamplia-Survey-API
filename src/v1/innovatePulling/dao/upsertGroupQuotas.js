const saveRecord = require('../../common/insertRecords');
module.exports.upsertGroupQuotas = async function upsertGroupQuotas(groupSurveysData) {
    try {
      const queryDemo = 'Insert into innovategroupsurveys (surveyId, groupSurveys, created_at, update_at) values ? ON DUPLICATE KEY UPDATE  groupSurveys = values(groupSurveys), update_at = values(update_at)';
      const result = saveRecord.insertRecord(queryDemo, groupSurveysData);
      return result;
    } catch (error) {
      throw new Error(`Oops Something went wrong: ${error.message}`);
    }
}