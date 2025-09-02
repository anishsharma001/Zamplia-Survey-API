var request = require('request');
const {updateAllSurveyStatus} = require('./getDemosFromZamplia');
const saveRecord = require('../../common/insertRecords');
// const updateLucidStudies = require('../../LucidSyncV1/UpdateLucidStudies');
// const PTwoDao = require('../../PTwoSampleUtils/PTwoDao');
// const mcqService = require('../../mcqIntegration/service/mcqService');
// const {updateProjectStatus} = require('../../purespactrumIntegration/pureSpectrumCreation/project')

async function surveysToPause(surveysToPause, Unimrkt_SURVEY_TYPE_ID) {

    let mappedStudyList = surveysToPause.map(x => 'UMT' + x);

    updateAllSurveyStatus(surveysToPause, Unimrkt_SURVEY_TYPE_ID);

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


    // //purespactrum
    // let query5 = `SELECT surveyId FROM purespectrummappingtostudies where surveyStatus='Live' and surveyId > 0 and sid in ( ? )`;
    // let pureMapping = await saveRecord.insertRecord(query5, mappedStudyList);
    // if (pureMapping[0].result) {
    //     for (let index in pureMapping[0].studyData) {

    //         let surveySID = pureMapping[0].studyData[index].surveyId;
    //         let status = "44";
    //         let pureRes = await updateProjectStatus(surveySID, status);
    //         console.log(pureRes);
    //     }
    // }


    // //PRODEGE
    // let query3 = 'SELECT studyId,prodgeId,quotaId FROM prodgemappingtostudies where isActive=1 and prodgeId >1 and studyId in ( ? )';
    // let prodgeMapping = await saveRecord.insertRecord(query3, mappedStudyList);
    // var date = new Date();
    // var time = date.getTime();
    // const baseUrl = "http://www.swagbucks.com/prodegemr";
    // const apik = "FARYBmDpWEXHztw";

    // if (prodgeMapping[0].result) {
    //     for (let index in prodgeMapping[0].studyData) {
    //         var projectUpdate = {
    //             'method': 'POST',
    //             'url': baseUrl + '/project-update',
    //             'headers': {
    //                 'Content-Type': 'application/x-www-form-urlencoded',
    //             },
    //             form: {
    //                 'apik': apik,
    //                 'request_date': time,
    //                 'signature': '{signature}',
    //                 'prodege_project_id': prodgeMapping[0].studyData[index].prodgeId,
    //                 'project_name': prodgeMapping[0].studyData[index].studyId,
    //                 'project_url': `https://zampparticipant.zamplia.com/?vid=7202011VENDOR1607322159095&sid=${prodgeMapping[0].studyData[index].studyId}&transaction_id=%transid%`,
    //                 'status': 'PAUSED',
    //                 'mobile_optimized': '',
    //                 'sample_size': '100'
    //             }
    //         };
    //         projectUpdate = await pordeSignature.signRequest(projectUpdate);
    //         request(projectUpdate, function (error, response) {
    //             console.log(response);
    //         });
    //     }
    // }
    
    // let updateQuery = "update lucidmappingtostudies set isActive=0 where studyId in ( ? )";
    // let updateQueryMCQ = `update marketcubesurvaymappings set survayStatus = 'On Hold' where sid in ( ? ) and survayStatus='Live' and vendorId = '2420212VENDOR1616592262014'`;
    // // let updateQueryProdge = 'update prodgemappingtostudies set isActive=0 where isActive=1 and studyId in (?)';

    // saveRecord.insertRecord(updateQuery, mappedStudyList);
    // saveRecord.insertRecord(updateQueryMCQ, mappedStudyList);
    // saveRecord.insertRecord(updateQueryProdge, mappedStudyList);
}




module.exports = {
    surveysToPause
}