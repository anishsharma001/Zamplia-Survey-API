
const { updateAllSurveyStatus , excuteQuery} = require('../model/lucidmodel');
const { ApiClientId } = require('./common')

async function pauseLucidSurveys ( surveyPauseData ){
    try{

        // let mappedStudyList = surveyPauseData.map(x => 'LD' + x);
        updateAllSurveyStatus(surveyPauseData, ApiClientId);
    
        //MCQ
        // const query = `select sid,survayId from marketcubesurvaymappings where sid in ( ? ) and survayStatus='Live' and survayId > 0  and vendorId = '2420212VENDOR1616592262014'`;
        // let studyToPauseOnMCQ = await excuteQuery(query, mappedStudyList);
        // if ( studyToPauseOnMCQ.length ) {
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
        //     let updateQueryMCQ = `update marketcubesurvaymappings set survayStatus = 'On Hold' where sid in ( ? ) and survayStatus='Live'  and vendorId = '2420212VENDOR1616592262014'`;
        //     excuteQuery(updateQueryMCQ, mappedStudyList);
        // }
    
    
        // // //purespactrum
        // const query5 = `SELECT surveyId FROM purespectrummappingtostudies where surveyStatus='Live' and surveyId > 0 and sid in ( ? )`;
        // let pureMapping = await excuteQuery(query5, mappedStudyList);
        // if (pureMapping.length) {
        //     for (let index in pureMapping) {
        //         let surveySID = pureMapping[index].surveyId;
        //         let status = "44";
                // let pureRes = await updateProjectStatus(surveySID, status);
        //         console.log(pureRes);
        //     }
        //     let updateQuery = "update purespectrummappingtostudies set surveyStatus = 'On Hold' where sid in ( ? ) and surveyStatus='Live' ";
        //     excuteQuery(updateQuery, mappedStudyList);
        // }
    } catch ( error ) {
        throw new Error("Oops Something went wrong during pause the survey!", error.message)
    }
}


module.exports={ pauseLucidSurveys }