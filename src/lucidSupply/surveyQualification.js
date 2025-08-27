const {  upsertStudyDemoDb,pauseQualficationNotMatchSurvey,upsertGlobaleDemoDB, logsUnMappedQualData, upsertStudyisRouterEligible ,upsertStudyDemoOrder, upsertDemoAgeIntoDb,upsertIntoUnmappedqualification } = require('./model/lucidmodel');
const { getQualificationFromApi } = require('./services/lucidServices');
const {batchPromises} = require('./operation');
const { lucidSupplyLogs } = require('./lucidLogs')
/**
 * Process Lucid survey qualifications and insert them into the database.
 * @param {Array} surveyData - Array of survey data.
 * @param {Array} allDBQualificationData - Array of all qualification data from the database.
 * @param {Array} allDbOptions - Array of all option data from the database.
 * @param {string} lang_code - Language code.
 * @returns {Promise<boolean>} - A Promise that resolves to true if the process is successful.
 * @throws {Error} - If an error occurs during the process.
 */
 async function lucidSurveyQualification(surveyData, allDBQualificationData, allDbOptions, lang_code) {
    try {
      let allStudyQualBundle = [];
      let allStudyAgeQualBundle = [];
      let allStudyQualOrderBundle=[];
      let unMappedQualificationSurveys = [];
      let unMappedQualDatas = [];
      let demosLangCode = [];
      let demoUnmaappedQualIds = [];
      let demoUnmaappedSurveyIds = [];
      // let globalStudyDemoMapping = []
  
      /**
       * Process the survey qualifications for each survey.
       * @param {Array} surveyIndex - Survey index.
       */
       const processSurvey = async (surveyIndex) => {
        try {
            const SurveyQualification = await getQualificationFromApi(surveyIndex[0]);
            if (SurveyQualification.ResultCount > 0 && SurveyQualification.SurveyQualification.Questions && SurveyQualification.SurveyQualification.Questions.length) {
                const createQualificationBundle = await qualificationBundle(SurveyQualification.SurveyQualification, allDBQualificationData, allDbOptions, lang_code);
                const { bundleNonRangeQualification, bundleGlobalDemoData, bundleRangeQualification, bundleRangeOrder, notMatched, unMappedQualData,unMappedSurveyId,unMappedQualIds,lang_codedata } = createQualificationBundle;
                if (notMatched) {
                     demoUnmaappedQualIds.push(...unMappedQualIds)
                     demoUnmaappedSurveyIds.push(...unMappedSurveyId)
                     demosLangCode.push(...lang_codedata)
                    unMappedQualDatas.push(...unMappedQualData)
                    unMappedQualificationSurveys.push("LD" + surveyIndex[0])
                }
                allStudyQualBundle.push(...bundleNonRangeQualification);
                allStudyAgeQualBundle.push(...bundleRangeQualification);
                allStudyQualOrderBundle.push(...bundleRangeOrder);
            }
        } catch (error) {
          lucidSupplyLogs(JSON.stringify(error), JSON.stringify(surveyIndex[0]) , 'SurveyQualifications', 0);
          console.error(`Error processing qualification for survey ${surveyIndex[0]}:`, error);
          return
        }
    };
    
    // const promises = surveyData.map(processSurvey);
    // const batchSize = 1;
  
    //   await batchPromises(promises, batchSize);
      for (const surveyIndex of surveyData) {
        await processSurvey(surveyIndex);
      }
      if(allStudyQualBundle.length){
        await upsertStudyDemoDb(allStudyQualBundle);
        // await upsertGlobaleDemoDB(globalStudyDemoMapping)
      }
      if(allStudyAgeQualBundle.length){
        await upsertDemoAgeIntoDb(allStudyAgeQualBundle);
      }
      if(allStudyQualOrderBundle.length){
        await upsertStudyDemoOrder(allStudyQualOrderBundle)
      }
      if(unMappedQualificationSurveys.length){
        await upsertStudyisRouterEligible(unMappedQualificationSurveys.join("','"));
        await logsUnMappedQualData(unMappedQualDatas)
      }

      if(demoUnmaappedSurveyIds.length && demoUnmaappedQualIds.length && demosLangCode.length){
          await upsertIntoUnmappedqualification(demoUnmaappedSurveyIds,demoUnmaappedQualIds,demosLangCode)
      }
      return true;
    } catch (error) {
      throw new Error(`Oops! Something went wrong. ${error.message}`);
    }
  }
  
  /**
   * Generate the qualification bundle for a Lucid survey.
   * @param {Object} lucidSurveyQualification - Lucid survey qualification data.
   * @param {Array} allDBZampliaQualification - Array of all qualification data from the database.
   * @param {Array} allDbOptions - Array of all option data from the database.
   * @param {string} lang_code - Language code.
   * @returns {Promise<Object>} - A Promise that resolves to an object containing the qualification bundles.
   * @throws {Error} - If an error occurs during the process.
   */
  async function qualificationBundle(lucidSurveyQualification, allDBZampliaQualification, allDbOptions, lang_code) {
    const bundleNonRangeQualification = [];
    const bundleRangeQualification = [];
    const bundleGlobalDemoData = [];
    const bundleNonRangeOrder=[];
    let unMappedQualData = [];
    let unMappedSurveyId=[];
    let unMappedQualIds = [];
    let lang_codedata =[];
    let notMatched = 0;
    const bundleRangeOrder = [];
    try {
      const surveyId = "LD" + lucidSurveyQualification.SurveyNumber;
      const allQuestions = lucidSurveyQualification.Questions;
      const date = new Date();
      let screenerOrderNumber = 1;
      const postalCodes = [79362,79357,79355,79361];
      for (const questionIndex of allQuestions) {
        const sqid = surveyId + questionIndex.QuestionID;
        const filterQuestion = allDBZampliaQualification.find((d) => d.lucidQid == questionIndex.QuestionID);
  
        if (!filterQuestion) {
          notMatched = 1;
          unMappedSurveyId.push(surveyId)
          unMappedQualIds.push(questionIndex.QuestionID)
          lang_codedata.push(lang_code)
          unMappedQualData.push([sqid, surveyId, questionIndex.QuestionID, new Date()]);
          continue;
        }
        let QuestionId = Number(questionIndex.QuestionID);
        if (Number(questionIndex.QuestionID) === 42 || Number(questionIndex.QuestionID) === 45 ||  postalCodes.includes(QuestionId)) {
          if (Number(questionIndex.QuestionID) === 45 ||  postalCodes.includes(QuestionId)) {
            const optionsText = questionIndex.PreCodes.join(",");
            bundleNonRangeQualification.push([
              sqid,
              surveyId,
              filterQuestion.demographicId,
              filterQuestion._id,
              "",
              optionsText,
              date,
              date,
              lang_code,
              sqid
            ]);
            // bundleGlobalDemoData.push([
            //   sqid,
            //   surveyId,
            //   filterQuestion.demographicId,
            //   filterQuestion._id,
            //   "",
            //   optionsText,
            //   date,
            //   date,
            //   lang_code
            // ])
            bundleRangeOrder.push([
                surveyId,
                filterQuestion.demographicId,
                screenerOrderNumber, date, date,
                lang_code,sqid
            ]);
          } else {
            const ages = questionIndex.PreCodes;
            const minAge = Math.min(...ages.map(Number));
            const maxAge = Math.max(...ages.map(Number));
            bundleRangeQualification.push([
              sqid,
              surveyId,
              filterQuestion.demographicId,
              filterQuestion._id,
              maxAge,
              minAge,
              date,
              date,
              lang_code,
              sqid
            ]);
            // bundleGlobalDemoData.push([
            //   sqid,
            //   surveyId,
            //   filterQuestion.demographicId,
            //   filterQuestion._id,
            //   "",
            //   minAge +"-"+maxAge,
            //   date,
            //   date,
            //   lang_code
            // ])

            bundleRangeOrder.push([
              surveyId,
              filterQuestion.demographicId,
              screenerOrderNumber, date, date,
              lang_code,sqid
            ])
          }
        } else {
          const filterOption = allDbOptions.filter((obj1) =>
            questionIndex.PreCodes.some((obj2) => obj2 == obj1.lucidOpId && obj1.queryId === filterQuestion._id)
          );
          const optionsIds = filterOption.map((d) => d._id).join(",");
          bundleNonRangeQualification.push([
            sqid,
            surveyId,
            filterQuestion.demographicId,
            filterQuestion._id,
            optionsIds,
            "",
            date,
            date,
            lang_code,
            sqid
          ]);
          // bundleGlobalDemoData.push([
          //   sqid,
          //   surveyId,
          //   filterQuestion.demographicId,
          //   filterQuestion._id,
          //   optionsIds,
          //   "",
          //   date,
          //   date,
          //   lang_code
          // ])
          bundleRangeOrder.push([
            surveyId,
            filterQuestion.demographicId,
            screenerOrderNumber, date, date,
            lang_code,sqid
        ]);
        }
        screenerOrderNumber++;
      }
      const data = { bundleNonRangeQualification, bundleRangeQualification, bundleRangeOrder, notMatched , unMappedQualData, bundleGlobalDemoData, unMappedSurveyId, unMappedQualIds, lang_codedata };
      return data;
    } catch (error) {
      const data = { bundleNonRangeQualification , bundleRangeQualification , bundleRangeOrder , notMatched  , unMappedQualData, bundleGlobalDemoData, unMappedSurveyId, unMappedQualIds, lang_codedata }; 
      return data;
    }
  }
  
  module.exports = { lucidSurveyQualification };
