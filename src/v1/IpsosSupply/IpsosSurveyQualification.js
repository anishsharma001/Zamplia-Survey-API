
const { getQuotaFromApi } = require('./services/IpsosService');
const { upsertStudyDemoDb, upsertDemoAgeIntoDb, upsertStudyDemoOrder, upsertStudyisRouterEligible,upsertIntoUnmappedqualification } = require('./model/ipsosModel');
/**
 * Process Full Circle survey qualifications and insert them into the database.
 * @param {Array} surveyData - Array of survey data.
 * @param {Array} allQualificationsDbData - Array of all qualification data from the database.
 * @param {Array} allDbOptions - Array of all option data from the database.
 * @param {string} lang_code - Language code.
 * @returns {Promise<boolean>} - A Promise that resolves to true if the process is successful.
 * @throws {Error} - If an error occurs during the process.
 */
async function IpsosSurveyQualification(surveyData, allQualificationsDbData, allDbOptions, lang_code, surveyAllData) {
    try {
      const allStudyQualBundle = [];
      const allStudyAgeQualBundle = [];
      const allStudyQualOrderBundle = [];
      const unMappedQualificationSurveys = [];
      const demoUnmappedSurveyIds = [];
      const demoUnmappedqualData = [];
      const lang_codedatas = [];
  
      /**
     * Process the survey qualifications for each survey.
     * @param {Array} surveyIndex - Survey index.
     */
      const processSurvey = async (surveyIndex) => {
        const SurveyQualification = await getQuotaFromApi(surveyIndex[16]);
  
        if (SurveyQualification && SurveyQualification.length) {  
          const createQualificationBundle = await IpsosqualificationBundle(SurveyQualification, allQualificationsDbData, allDbOptions, lang_code, "IPSOS"+surveyIndex[16]);
          const { bundleNonRangeQualification, bundleRangeQualification, bundleRangeOrder , notMatched, unMappedQualData,lang_codedata,unMapSurveyIds,unMapQualData} = createQualificationBundle;
  
          if( bundleNonRangeQualification.length )   allStudyQualBundle.push(...bundleNonRangeQualification);
          if( bundleRangeQualification.length ) allStudyAgeQualBundle.push(...bundleRangeQualification);
          if( bundleRangeOrder.length ) allStudyQualOrderBundle.push(...bundleRangeOrder);
          if( notMatched ){
            demoUnmappedSurveyIds.push(...unMapSurveyIds);
            demoUnmappedqualData.push(...unMapQualData);
            lang_codedatas.push(...lang_codedata);
            unMappedQualificationSurveys.push(...unMappedQualData)
          } ;
        }
      };
  
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
        // await logsUnMappedQualData(unMappedQualDatas)
      }
     if( demoUnmappedSurveyIds.length && demoUnmappedqualData.length && lang_codedatas.length){
      await upsertIntoUnmappedqualification(demoUnmappedSurveyIds,demoUnmappedqualData,lang_codedatas);

     }
    } catch (error) {
      throw new Error(`Oops! Something went wrong. ${error.message}`);
    }
  }


/**
 * Generate the qualification bundle for a Lucid survey.
 * @param {Object} IpsosSurveyQualification - Lucid survey qualification data.
 * @param {Array} allDBZampliaQualification - Array of all qualification data from the database.
 * @param {Array} allDbOptions - Array of all option data from the database.
 * @param {string} lang_code - Language code.
 * @returns {Promise<Object>} - A Promise that resolves to an object containing the qualification bundles.
 * @throws {Error} - If an error occurs during the process.
 */
async function IpsosqualificationBundle(IpsosSurveyQualification, allDBZampliaQualification, allDbOptions, lang_code, surveyId) {
  const bundleNonRangeQualification = [];
  const bundleRangeQualification = [];
  const bundleGlobalDemoData = [];
  const bundleNonRangeOrder = [];
  let unMappedQualData = [];
  let notMatched = 0;
  const bundleRangeOrder = [];
  let uniqueQuestionId = [];
  let quotaQualificationsRows = [];
  let questionBind = [];
  let lang_codedata=[];
  let unMapQualData=[];
  let unMapSurveyIds=[];
  try {
    for (let i = 1; i < IpsosSurveyQualification.length; i++) {
      const questionData = IpsosSurveyQualification[i].questions.map((d) => d.id);
      uniqueQuestionId = [...uniqueQuestionId, ...questionData]
    }
    uniqueQuestionId = [...new Set(uniqueQuestionId)];
    for (let i = 0; i < uniqueQuestionId.length; i++) {
      let question = IpsosSurveyQualification.filter((d) => d.questions.find((dd) => dd.id == uniqueQuestionId[i]));
      question = question.map((d) => d.questions)
      question = question.flatMap((d) => d);
      let answers = question.map((d) => d.answers);
      answers = answers.flatMap((d) => d)
      if (question.length > 0) {
        questionBind.push({
          id: question[0].id,
          locale: question[0].locale,
          operator: question[0].operator,
          answers: answers
        })
      }
    }
    for (var i = 0; i < questionBind.length; i++) {
      let firstQuestionInfo = IpsosSurveyQualification.shift();
      let questionInfo = IpsosSurveyQualification.filter(d => d.questions[0].id == questionBind[i].id)
      if (questionInfo.length > 0) {
        let ansIds = []
        for (var j = 0; j < questionBind[i].answers.length; j++) {
          if (questionBind[i].answers[j].hasOwnProperty("rangeStart") || questionBind[i].answers[j].hasOwnProperty("rangeEnd")) {
            let low = +questionBind[i].answers[j].rangeStart;
            let high = +questionBind[i].answers[j].rangeEnd;
            let age = await getAgeForIpsos(low, high);
            ansIds.push(...age);
            //ansIds = ansIds.length ? [ansIds[0],ansIds[ansIds.length-1]].join(","): 0;
          } else {
            let ans = questionBind[i].answers[j].id
            ansIds.push(ans)
            
          }
        }
        ansIds = ansIds.join(",");
        quotaQualificationsRows.push([
          surveyId,
          questionBind[i].id,
          ansIds,
          questionInfo[0].name,
          questionInfo[0].type,
          lang_code
        ]);
      }
    }
    const allQuestions = quotaQualificationsRows || [];

    const date = new Date();
    let screenerOrderNumber = 1;
    const postalCodes = [12205,12257];
    for ( const quotaIndex of allQuestions ) {
          const sqid = surveyId + quotaIndex[1];
          const filterQuestion = allDBZampliaQualification.find((d) => d.ipsosQid == quotaIndex[1]);
    
          if (!filterQuestion) {
            notMatched = 1;
            unMapSurveyIds.push(surveyId);
            unMapQualData.push(  quotaIndex[1]);
            lang_codedata.push(lang_code);
            unMappedQualData.push(surveyId);
            continue;
          }
          let QuestionId = Number(quotaIndex[1]);
          if (Number(QuestionId) === -1 ||  postalCodes.includes(QuestionId)) {
            if (postalCodes.includes(QuestionId)) {
              const optionsText = quotaIndex[2];
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
              bundleRangeOrder.push([
                  surveyId,
                  filterQuestion.demographicId,
                  screenerOrderNumber, date, date,
                  lang_code,sqid
              ]);
            } else {
              let AgeArray = quotaIndex[2].split(',').map(Number);
              const minAge = Math.min(...AgeArray);
              const maxAge = Math.max(...AgeArray);
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
              bundleRangeOrder.push([
                surveyId,
                filterQuestion.demographicId,
                screenerOrderNumber, date, date,
                lang_code,sqid
              ])
            }
          } else {
            let allOptions = quotaIndex[2].split(",").map(Number);
            const filterOption = allDbOptions.filter((obj1) =>
              allOptions.some((obj2) => obj2 == obj1.ipsosOid && obj1.queryId === filterQuestion._id)
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
            bundleRangeOrder.push([
              surveyId,
              filterQuestion.demographicId,
              screenerOrderNumber, date, date,
              lang_code,sqid
          ]);
          }
          screenerOrderNumber++;
        
      }
      return { bundleNonRangeQualification, bundleRangeQualification, bundleRangeOrder, notMatched , unMappedQualData, bundleGlobalDemoData, lang_codedata, unMapSurveyIds, unMapQualData };
    } catch (error) {
      return { bundleNonRangeQualification , bundleRangeQualification , bundleRangeOrder , notMatched  , unMappedQualData, bundleGlobalDemoData , lang_codedata, unMapSurveyIds, unMapQualData}; 
      
    }
  }

async function getAgeForIpsos(low, high) {
  let options = [];
  for (var j = low; j <= high; j++) {
      if (j > 17 && j < 100) {
          options.push(j.toString());
      }
  }
  return options;
}


module.exports = { IpsosSurveyQualification };