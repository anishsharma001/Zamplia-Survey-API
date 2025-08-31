const request = require('request');
const {insertRecord} = require('./comman');
// const { deletePulledStudies } = require('../mcqCrons/comman');
const { getSurveyGroupFromMcq} = require('./services');
const { updateGroupSurveysData } = require('./comman');
const _ = require('lodash');

const getGroupsFromServer = async function (getURl, surveyId) {
    return new Promise(function (resolve, reject) {
        let url = getURl + surveyId;
        let headers = {
            'Content-Type': 'application/json',
        };

        request.get({ url: url, headers: headers }, function (e, r, body) {
            // your callback body

            let data = {};
            data.success = false;
            if (r !== undefined) {
                if (r.statusCode === 200) {
                    if (body) {
                        let response = JSON.parse(body);
                        let surveyID = response.SurveyId
                        data.success = true;
                        if (response.SurveyGroups != undefined && response.SurveyGroups.length > 0) {
                            let allSurveysInGroup = [];
                            for (let index in response.SurveyGroups) {
                                let SurveyGroupSurveys = response.SurveyGroups[index].SurveyGroupSurveys;
                                // SurveyGroupSurveys.map(i => 'MCQ' + i);
                                for (let i = 0; i < SurveyGroupSurveys.length; i++) {
                                    SurveyGroupSurveys[i] = "MCQ" + SurveyGroupSurveys[i];
                                }

                                allSurveysInGroup.push(SurveyGroupSurveys);
                            }

                            allSurveysInGroup = allSurveysInGroup.join();

                            let createRecordIntoDb = [];

                            createRecordIntoDb.push(["MCQ" + surveyID, allSurveysInGroup, new Date(), new Date()])

                            let queryDemo = `insert into  mcqgroupsurveys( surveyId, groupSurveys, 
                                createdAt, updatedAt) values ? ON 
                                DUPLICATE KEY UPDATE groupSurveys=values(groupSurveys) ,updatedAt=values(updatedAt)`;

                            console.log(queryDemo);
                            // _.map(createRecordIntoDb,(d) => deletePulledStudies(d[0]))
                            insertRecord(queryDemo, createRecordIntoDb)
                        }
                        resolve(data);
                    } else {
                        resolve(data);
                    }
                } else {
                    resolve(data);
                }
            } else {
                resolve(data);
            }
        });
    });
}

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