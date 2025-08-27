const { getSurveyGroupFromLucid } = require('./services/lucidServices');
const { upsertGroupQuotas, updateGroupSurveysData,getExistingGroupSecurityID,updateGroupSecurity } = require('./model/lucidmodel');
const {batchPromises} = require('./operation');


async function createGroupSurveys(allSurveysData){
    try{
        const batchSize = 5;
        for (let i = 0; i < allSurveysData.length; i += batchSize) {
            const batch = allSurveysData.slice(i, i + batchSize);
            const surveyIds = batch.map(surveyData => surveyData[16]);
            await processSurveysInBatch(surveyIds);
        }
        return true;
    }catch(error){
        return false;
    }
} 

async function createGroupSurveysAllocated(allSurveysData){
    try{
        const batchSize = 5;
        for (let i = 0; i < allSurveysData.length; i += batchSize) {
            const batch = allSurveysData.slice(i, i + batchSize);
            const surveyIds = batch.map(surveyData => surveyData[12]);
            await processSurveysInBatch(surveyIds);
        }
        return true;
    }catch(error){
        throw new Error("Oops Something went wrong, during survey group creation!",error.message)
    }
} 



const processSurveysInBatch = async (surveyIds) => {
    try {
        const surveyGroupDataPromises = surveyIds.map(id => getSurveyGroupFromLucid(id));
        const surveyGroupDataArray = await Promise.all(surveyGroupDataPromises);

        const allSurveyGroups = [];
        surveyGroupDataArray.forEach(surveyGroupData => {
            if (surveyGroupData.ResultCount && surveyGroupData.hasOwnProperty("SurveyGroups")) {
                allSurveyGroups.push({groups : [...(surveyGroupData.SurveyGroups.map((item) => item.SurveyGroupID))], surveyId : surveyGroupData.surveyId});
            }
        });

        //const surveyGroupIds = [];
        //const surveyGroupSurveysIds = [];

        const existingGroups = await getExistingGroupSecurityID(allSurveyGroups.map((item)=> "LD" + item.surveyId))


        for (let i = 0; i < existingGroups.length; i++) {
            const existing = existingGroups[i];
            const survey = allSurveyGroups.find((item) => `LD${item.surveyId}` == existing._id);
            if(survey){
                if(existing.groupsecurity && existing.groupsecurity != null){
                    const eGroupId = existing.groupsecurity.split(',');
                    const isNew = survey.groups.find((item)=> !eGroupId.includes(`${item}`))
                    if(isNew){
                        await updateGroupSecurity(`LD${survey.surveyId}`,survey.groups.toString())
                    }
                }else {
                    await updateGroupSecurity(`LD${survey.surveyId}`,survey.groups.toString())
                }
            }
        }


        // allSurveyGroups.forEach(item => {
        //     //surveyGroupIds.push(item.SurveyGroupID);
        //     const surveyGroupSurveys = item.SurveyGroupSurveys.map(survey => "LD" + survey);
        //     //surveyGroupSurveysIds.push(...surveyGroupSurveys);
        //     console.log(surveyGroupSurveys)
        // });

        //const formattedSurveyGroupSurveys = surveyGroupSurveysIds.map(item => `'${item}'`).join(',');
        //const formattedSurveyGroupIds = surveyGroupIds.join(',');

        //await updateGroupSurveysData(formattedSurveyGroupSurveys, formattedSurveyGroupIds);
        //await updateGroupSurveysData(1, formattedSurveyGroupIds);
    } catch (error) {
        console.error("Error processing surveys in batch:", error);
    }
};

module.exports ={createGroupSurveys, createGroupSurveysAllocated}