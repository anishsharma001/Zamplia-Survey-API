const NetworkService = require('./NetworkService');
const {getLangIdFromDb,getAppConfig, upsertStudiesData, getAllQualificationFromDb,getAllOptionsFromDb, getAllLiveSurveyFromDb, pauseBioBrainSurveys } = require('./dao');
const {createSuveyBundle, insertQuals, insertQuotas } = require('./operations');
const {difference} = require('lodash');



async function getProjectFromApi(lang_Code) {
    try {
        let surveysFromBrainBrio = await NetworkService.getAllSurveys();
        let surveys = [];
        let LanguageId = await getLangIdFromDb(lang_Code);
        
      if (surveysFromBrainBrio.success && surveysFromBrainBrio.result.Surveys.length) {
         surveys = surveysFromBrainBrio.result.Surveys;
            surveys = surveys.filter(function (record) {
                
            return record.Ir > 25
                && record.Loi <= 25  && record.LanguageId == LanguageId.marketCubeId;
        });
           let buyerConfig = await getAppConfig('biobrainBuyerConfig');
           if(buyerConfig.length && buyerConfig[0].isActive == 1){
            let config = buyerConfig[0].activeClientIds.split(',').map(Number);
            let key = buyerConfig[0].key;
            if (key.includes(lang_Code)) {
                surveys = surveys.filter(survey => config.includes(survey.BuyerId));
            }
            
           }
            let surveyBundleData = await createSuveyBundle(surveys, lang_Code);
            let allIncomingSurveyIds = surveyBundleData[1];
            let allDbSurveys = await getAllLiveSurveyFromDb(lang_Code);
            let surveysToPause = difference(allDbSurveys, allIncomingSurveyIds);

            if (surveyBundleData[0].length) {
                await upsertStudiesData(surveyBundleData[0]);
                let allQualifications = await getAllQualificationFromDb(lang_Code);
                let allOptions = await getAllOptionsFromDb(lang_Code);
                await insertQuals(allQualifications, allOptions, surveyBundleData[1], lang_Code);
                await insertQuotas(allQualifications, allOptions, surveyBundleData, lang_Code);
                
            }
            if(surveysToPause.length){
                pauseBioBrainSurveys(surveysToPause, 43);
            }

        }
        return;
    } catch (error) {
 return
    }

}

module.exports = {getProjectFromApi}