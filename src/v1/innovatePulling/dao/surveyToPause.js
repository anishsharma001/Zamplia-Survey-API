const updateSurveyStatus = require('./updateAllSurveyStatus');
const saveRecord = require('../../common/insertRecords');
// const updateLucidStudies = require('../../LucidSyncV1/UpdateLucidStudies');
// const PTwoDao = require('../../PTwoSampleUtils/PTwoDao');
// const mcqService = require('../../mcqIntegration/service/mcqService');

async function surveysToPause(surveysToPause, INNOVATE_SURVEY_TYPE_ID) {

    let mappedStudyList = surveysToPause.map(x => 'INN' + x);

    updateSurveyStatus.updateAllSurveyStatus(surveysToPause, INNOVATE_SURVEY_TYPE_ID);

    // // LUCID
    // let query = "select studyId,surveySID from lucidmappingtostudies where isActive=1  and  studyId in ( ? )";
    // let studyList = await saveRecord.insertRecord(query, mappedStudyList);
    // if (studyList[0].result) {
    //     for (let index in studyList[0].studyData) {
    //         let query = {};
    //         query.surveyId = studyList[0].studyData[index].surveySID;
    //         query.status = "04";
    //         query.precisionSurveyId = studyList[0].studyData[index].studyId;
    //         let req = {};
    //         req.query = query;
    //         let lucidRes = await updateLucidStudies.updateLucidStudies(req);
    //         console.log(lucidRes);
    //     }
    // }

    // //MCQ
    // let studyToPauseOnMCQ = await PTwoDao.getStudiesFromMappings(mappedStudyList);
    // if (studyToPauseOnMCQ.length > 0) {
    //     for (index in studyToPauseOnMCQ) {
    //         let surveySID = studyToPauseOnMCQ[index].survayId;
    //         let mcqStudyData = await mcqService.getSurveyById(surveySID);
    //         if (mcqStudyData.success) {
    //             let surveyData = mcqStudyData.result;
    //             surveyData.surveyStatusId = 2;
    //             surveyData.live_Url = surveyData.surveyLiveURL;
    //             let mcqRes = await mcqService.updateSurveyStatus(surveyData);
    //             console.log(mcqRes);
    //         }
    //     }
    // }
    
    // let updateQuery = "update lucidmappingtostudies set isActive=0 where studyId in ( ? )";
    // let updateQueryMCQ = `update marketcubesurvaymappings set survayStatus = 'On Hold' where sid in ( ? ) and survayStatus='Live'  and vendorId = '2420212VENDOR1616592262014'`;
    // // let updateQueryProdge = 'update prodgemappingtostudies set isActive=0 where isActive=1 and studyId in (?)';

    // saveRecord.insertRecord(updateQuery, mappedStudyList);
    // saveRecord.insertRecord(updateQueryMCQ, mappedStudyList);
    // // saveRecord.insertRecord(updateQueryProdge, mappedStudyList);
}

module.exports = {
    surveysToPause
}