const exp = require("express");
const meta = require('../../config/meta.json');
const redis = require('../../middlewares/redisClient');
// const log4js = require('../common/logger');
// const logger = log4js.getLogger('McqSurveyQualification');
const { getQualificationFromApi } = require('./services');
const { upsertStudyDemoDb, upsertDemoAgeIntoDb, upsertStudyDemoOrder, upsertStudyisRouterEligible,upsertIntoUnmappedqualification } = require('./comman')

const cacheKeys = {

  ALL_CACHED_STUDIES: {
    key: 'MCQ_Survey_quaification',
    expiry: meta.noExpire
  },
};

module.exports = class McqSurveyQualification {
  constructor(id) {
    this.id = id;
  }

  saveQualifications(qData, data, msg) {
    let query = `insert into  mcqsurveyqualifications( qualificationId, logicalOperator, 
        qTypeId, answerIds, answerCodes, langId, studyId) values ? ON 
        DUPLICATE KEY UPDATE qTypeId=values(qTypeId) ,answerIds=values(answerIds) ,answerCodes=values(answerCodes) ,logicalOperator=values(logicalOperator),langId=values(langId)`;


    queryWrapper.execute(query, [qData], function (responseData) {
      if (responseData.errno && responseData.errno !== undefined) {
        // logger.info(`ERROR : ${responseData.sqlMessage}`);

        return (data(responseData, meta.sqlError))
      } else {
        return (data(responseData, meta.success))
      }

    });


  }


  getMCQSurvey(qData, data, msg) {

    let query = `select  mq.studyId, mq.qualificationId,  mq.logicalOperator,  mq.qTypeId,  mq.answerIds, 
         mq.answerCodes,  mq.langId,  mm.name,mm.textData from mcqsurveyqualifications mq inner join 
         mcqmasteranswers mm on mq.qualificationId=mm.qualificationId  where mq.studyId='${qData.surveyId}'  and mq.langId='${qData.langId}' `;
    let id = `${qData.surveyId}_${qData.langId}`;

    //redis.removeOne(`MCQ_Survey_quaification~id_${id}`);
    redis.getData(cacheKeys.ALL_CACHED_STUDIES, query, [], { id }).then(function (responseData) {
      if (responseData.errno && responseData.errno !== undefined) {
        // logger.error(`ERROR : ${responseData.sqlMessage}`);

        return (data(responseData, meta.sqlError))
      } else {
        const sid = responseData.length > 0 ? responseData[0].studyId : 'None';
        // logger.info(`Found Study Id: ${sid}`);
        return (data(responseData, meta.success))
      }

    }).catch(function (error) {
      // logger.error("Error " + error);
      return (data(error, meta.sqlError));
    });



  }


  async McQSurveyQualifications(surveys, allDBQualificationData, allDbOptions, allLangCode) {
    try {
      let allStudyQualBundle = [];
      let allStudyAgeQualBundle = [];
      let allStudyQualOrderBundle = [];
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
          const SurveyQualification = await getQualificationFromApi(surveyIndex.SurveyId);
          if (SurveyQualification.hasOwnProperty("Result") && SurveyQualification.Result.TotalCount > 0 && SurveyQualification.SurveyQualifications.length) {
            let langCode = allLangCode.filter(item => item.marketCubeId == surveyIndex.LanguageId).map(d => d.lang_code).join("");
            const createQualificationBundle = await this.qualificationBundle(SurveyQualification, allDBQualificationData, allDbOptions, langCode);
            const { bundleNonRangeQualification, bundleGlobalDemoData, bundleRangeQualification, bundleRangeOrder, notMatched, unMappedQualData,unMappedSurveyId,unMappedQualIds,lang_codedata } = createQualificationBundle;
            if (notMatched) {
              demoUnmaappedQualIds.push(...unMappedQualIds)
              demoUnmaappedSurveyIds.push(...unMappedSurveyId)
              demosLangCode.push(...lang_codedata)
              unMappedQualDatas.push(...unMappedQualData)
              unMappedQualificationSurveys.push("MCQ" + surveyIndex.SurveyId)
            }
            allStudyQualBundle.push(...bundleNonRangeQualification);
            allStudyAgeQualBundle.push(...bundleRangeQualification);
            allStudyQualOrderBundle.push(...bundleRangeOrder);
          }
        } catch (error) {
          lucidSupplyLogs(JSON.stringify(error), JSON.stringify(surveyIndex.SurveyId), 'SurveyQualifications', 0);
          console.error(`Error processing qualification for survey ${surveyIndex.SurveyId}:`, error);
          return
        }
      };

      const promises = surveys.map(processSurvey);
      const batchSize = 1;
      await this.batchPromises(promises, batchSize);

      if (allStudyQualBundle.length) {
        await upsertStudyDemoDb(allStudyQualBundle);
        // await upsertGlobaleDemoDB(globalStudyDemoMapping)
      }
      if (allStudyAgeQualBundle.length) {
        await upsertDemoAgeIntoDb(allStudyAgeQualBundle);
      }
      if (allStudyQualOrderBundle.length) {
        await upsertStudyDemoOrder(allStudyQualOrderBundle)
      }
      if (unMappedQualificationSurveys.length) {
        await upsertStudyisRouterEligible(unMappedQualificationSurveys.join("','"));
        // await logsUnMappedQualData(unMappedQualDatas)
      }
      if(demoUnmaappedSurveyIds.length && demoUnmaappedQualIds.length && demosLangCode.length){
          await upsertIntoUnmappedqualification(demoUnmaappedSurveyIds,demoUnmaappedQualIds,demosLangCode)
      }

      return true;
    } catch (error) {
      throw new Error(`Oops! Something went wrong. ${error.message}`);
    }
  }
  async qualificationBundle(MCQSurveyQualification, allDBZampliaQualification, allDbOptions, lang_code) {
    const bundleNonRangeQualification = [];
    const bundleRangeQualification = [];
    const bundleGlobalDemoData = [];
    const bundleNonRangeOrder = [];
    let unMappedQualData = [];
    let unMappedSurveyId=[];
    let unMappedQualIds = [];
    let lang_codedata =[];
    let notMatched = 0;
    const bundleRangeOrder = [];
    try {
      const surveyId = "MCQ" + MCQSurveyQualification.SurveyId;
      const allQuestions = MCQSurveyQualification.SurveyQualifications;
      const date = new Date();
      let screenerOrderNumber = 1;
      const postalCodes = [17365, 2081, 636, 17619, 4595];
      for (const questionIndex of allQuestions) {
        const sqid = surveyId + questionIndex.QualificationId;
        const filterQuestion = allDBZampliaQualification.find((d) => d.mcqQid == questionIndex.QualificationId && d.lang_code == lang_code);
        if (!filterQuestion) {
          notMatched = 1;
          unMappedSurveyId.push(surveyId)
          unMappedQualIds.push(questionIndex.QualificationId)
          lang_codedata.push(lang_code)
          unMappedQualData.push([sqid, surveyId, questionIndex.QualificationId, new Date()]);
          continue;
        }
        let QuestionId = Number(questionIndex.QualificationId);
        if (QuestionId === 59 || QuestionId === 143 || postalCodes.includes(QuestionId)) {
          if (QuestionId === 143 || postalCodes.includes(QuestionId)) {
            const optionsText = questionIndex.AnswerIds.join(",");
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
              lang_code, sqid
            ]);
          } else {
            const ages = questionIndex.AnswerIds[0].split("-");
            const minAge = Number(ages[0]);
            const maxAge = Number(ages[1]);
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
              lang_code, sqid
            ])
          }
        } else {
          const filterOption = allDbOptions.filter((obj1) =>
            questionIndex.AnswerCodes.some((obj2) => obj2 == obj1.mcqOpId && obj1.queryId === filterQuestion._id)
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
            lang_code, sqid
          ]);
        }
        screenerOrderNumber++;
      }
      const data = { bundleNonRangeQualification, bundleRangeQualification, bundleRangeOrder, notMatched, unMappedQualData, bundleGlobalDemoData ,unMappedSurveyId,unMappedQualIds,lang_codedata};
      return data;
    } catch (error) {
      const data = { bundleNonRangeQualification, bundleRangeQualification, bundleRangeOrder, notMatched, unMappedQualData, bundleGlobalDemoData ,unMappedSurveyId,unMappedQualIds,lang_codedata};
      return data;
    }
  }
  async batchPromises(promises, batchSize) {
    const results = [];

    for (let i = 0; i < promises.length; i += batchSize) {
      const batch = promises.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map((promise) => promise));
      results.push(...batchResults);
    }
    return results;
  }
}