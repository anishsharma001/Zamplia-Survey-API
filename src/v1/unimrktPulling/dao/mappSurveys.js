
async function mappSurveys (qualificationSurveys, desiredQualification ){
    try{
        let matchedSurveys = [];
        let surveyIds = [];
        let unMatchedSurveysIds = [];
        let unMatchQualification = [];

        for (let i = 0; i < qualificationSurveys.length; i++) {
            const datapoints = Array.isArray(qualificationSurveys[i]?.questions) 
    ? qualificationSurveys[i].questions.map(dp => dp.questionId) 
    : [];
            // const datapoints = qualificationSurveys[i].datapoints;
            // Check if datapoints fully match desiredQualification array
            const match = datapoints.every(dp => desiredQualification.includes(dp));
    
            if (match) {
                surveyIds.push(qualificationSurveys[i].surveyId);    
                matchedSurveys.push(qualificationSurveys[i]); // Return the survey if there's a full match
            }else{
                // filter which datapoints are not matching in desiredQualification array
                surveyIds.push(qualificationSurveys[i].surveyId);    
                matchedSurveys.push(qualificationSurveys[i]); 
                let unMatchpints = datapoints.filter(dp => !desiredQualification.includes(dp));
                unMatchQualification.push(unMatchpints)
                unMatchedSurveysIds.push(qualificationSurveys[i].surveyId);
            }
        }
        return [matchedSurveys, surveyIds,unMatchedSurveysIds,unMatchQualification]; // Return null if no survey matches
    } catch ( error ) {
        return ("Oops Something went wrong during pause the survey!", error.message)
    }
}

module.exports={ mappSurveys}