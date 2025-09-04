const {insertRecord} = require('./comman');
// const { deletePulledStudies } = require('../mcqCrons/comman');
const { getSurveyGroupFromMcq} = require('./services');
const { updateGroupSurveysData } = require('./comman');
const _ = require('lodash');

const getGroupsFromServer = async function (getURL, surveyId) {
  let data = { success: false };

  try {
    const url = getURL + surveyId;
    const headers = { 'Content-Type': 'application/json' };

    const response = await axios.get(url, { headers });

    if (response.status === 200 && response.data) {
      const responseBody = response.data;
      const surveyID = responseBody.SurveyId;
      data.success = true;

      if (responseBody.SurveyGroups && responseBody.SurveyGroups.length > 0) {
        let allSurveysInGroup = [];

        responseBody.SurveyGroups.forEach(group => {
          let SurveyGroupSurveys = group.SurveyGroupSurveys.map(i => "MCQ" + i);
          allSurveysInGroup.push(SurveyGroupSurveys);
        });

        allSurveysInGroup = allSurveysInGroup.join();

        const createRecordIntoDb = [
          ["MCQ" + surveyID, allSurveysInGroup, new Date(), new Date()]
        ];

        const queryDemo = `INSERT INTO mcqgroupsurveys(surveyId, groupSurveys, createdAt, updatedAt)
          VALUES ? 
          ON DUPLICATE KEY UPDATE groupSurveys=VALUES(groupSurveys), updatedAt=VALUES(updatedAt)`;

        console.log(queryDemo);

        await insertRecord(queryDemo, createRecordIntoDb);
      }
    }

    return data;

  } catch (error) {
    console.error("Error fetching groups from server:", error.message || error);
    return data;
  }
};

async function createGroupSurveys(allSurveysData) {
    try {
        for (let i = 0; i < allSurveysData.length; i++) {
            let surveyIndex = allSurveysData[i];
            await processSurveys(surveyIndex[14]);
        }
    } catch (error) {
        return false;
    }
}


const processSurveys = async (surveyId) => {
    try {
        const surveyGroupData = await getSurveyGroupFromMcq(surveyId);
        if (surveyGroupData.hasOwnProperty("SurveyGroups") && surveyGroupData.SurveyGroups) {
            const allSurveysGroup = surveyGroupData.SurveyGroups;
            const surveyGroupids = [];
            const surveyGroupSurveysIds = [];

            for (const item of allSurveysGroup) {
                surveyGroupids.push(item.SurveyGroupId);
                const surveyGroupSurveys = item.SurveyGroupSurveys.map(survey => "MCQ" + survey);
                surveyGroupSurveysIds.push(surveyGroupSurveys);
            }

            const formattedSurveyGroupSurveys = surveyGroupSurveysIds.map(item => `'${item.join("','")}'`).join(',');
            const formattedSurveyGroupIds = surveyGroupids.map(item => `${item}`).join(',');

            await updateGroupSurveysData(formattedSurveyGroupSurveys, formattedSurveyGroupIds);
        }
        return true;
    } catch (error) {
        console.error("Error processing surveys:", error);
        return false;
    }
};

module.exports = {createGroupSurveys, getGroupsFromServer}