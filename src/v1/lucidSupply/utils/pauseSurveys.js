
const { updateAllSurveyStatus , excuteQuery} = require('../model/lucidmodel');
const { ApiClientId } = require('./common')

const {PauseSyncOnVendorApis} = require('../../pauseSyncStudiesOnVendors/services')

async function pauseLucidSurveys ( surveyPauseData ){
    try{

        // let mappedStudyList = surveyPauseData.map(x => 'LD' + x);
        await updateAllSurveyStatus(surveyPauseData, ApiClientId);
    
        for (let index = 0; index < surveyPauseData.length; index++) {
            let id = surveyPauseData[index];
            id = 'LD' + id
            PauseSyncOnVendorApis(id)
        }
        
    } catch ( error ) {
        throw new Error("Oops Something went wrong during pause the survey!", error.message)
    }
}


module.exports={ pauseLucidSurveys }