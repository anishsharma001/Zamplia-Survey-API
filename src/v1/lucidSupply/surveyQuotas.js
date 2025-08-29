const { pauseUnAvailableQuotas, getAllInsertedQuotas, insertQuotaDemoIntoDb, InsertQuotaDataIntoDb } = require("./model/lucidmodel");
const { getQuotaFromLucid } = require("./services/lucidServices");
const { batchPromises } = require("./operation");
const { lucidSupplyLogs } = require("./lucidLogs");
const { qualificationBundle } = require('./surveyQualification')

/**
 * Process Lucid survey quotas.
 * @param {Array} surveyData - Survey data.
 * @param {Array} allDBQualificationData - All qualification data.
 * @param {Array} allDbOptions - All options data.
 * @param {string} lang_code - The language code.
 * @returns {Promise<boolean>} A promise that resolves to true when quotas are processed successfully.
 */
async function lucidSurveyQuota(surveyData, allDBQualificationData, allDbOptions, lang_code, insertedQualification) {
  try {
    const allSurveysQuota = [];
    const allSurveyIds = [];
    const allClientQuotaDatas = [];

    const processQuotas = async (surveyIndex) => {
      try {
        const { 0: surveyId } = surveyIndex;
        allSurveyIds.push(surveyId);
        const clientQuotaData = await getQuotaFromLucid(surveyId);
        if (clientQuotaData.ResultCount > 1) {
          allClientQuotaDatas.push(clientQuotaData);
          const createQuotaBundle = await quotaBundle(clientQuotaData, lang_code, surveyData);
          if (createQuotaBundle.length) {
            allSurveysQuota.push(...createQuotaBundle);
          }
        }
      } catch (error) {
        lucidSupplyLogs(JSON.stringify(error), JSON.stringify(surveyId), "SurveyQuotas", 0);
        console.error(`Error processing quotas for survey ${surveyId}:`, error);
        return;
      }
    };

    // Use Promise.all to execute promises concurrently
    const promises = surveyData.map(processQuotas);
    const batchSize = 50;
    await batchPromises(promises, batchSize);

    await InsertQuotaDataIntoDb(allSurveysQuota);
    const getAllQuotaIds = await getAllInsertedQuotas(allSurveyIds);
    const createQuotaDemoBundle = await getSurveyQuotaDemo(getAllQuotaIds, allClientQuotaDatas, allDBQualificationData, allDbOptions, insertedQualification);

    await insertQuotaDemoIntoDb(createQuotaDemoBundle.quotaDemoBundle);

    if (createQuotaDemoBundle.pauseQuotasUnAvailable.length) {
      await pauseUnAvailableQuotas(createQuotaDemoBundle.pauseQuotasUnAvailable);
    }

    if (createQuotaDemoBundle.allQualNeedToInsertInDb.length) {

      let allStudyQualBundle = [];
      let allStudyAgeQualBundle = [];
      let allStudyQualOrderBundle = [];
      let unMappedQualificationSurveys = [];
      let unMappedQualDatas = [];
      let demosLangCode = [];
      let demoUnmaappedQualIds = [];
      let demoUnmaappedSurveyIds = [];

      for (let surveyIndex = 0; surveyIndex < createQuotaDemoBundle.allQualNeedToInsertInDb.length; surveyIndex++) {
        let index = createQuotaDemoBundle.allQualNeedToInsertInDb[surveyIndex];
        const createQualificationBundle = await qualificationBundle(index, allDBQualificationData, allDbOptions, lang_code);
        const { bundleNonRangeQualification, bundleGlobalDemoData, bundleRangeQualification, bundleRangeOrder, notMatched, unMappedQualData, unMappedSurveyId, unMappedQualIds, lang_codedata } = createQualificationBundle;
        if (notMatched) {
          demoUnmaappedQualIds.push(...unMappedQualIds);
          demoUnmaappedSurveyIds.push(...unMappedSurveyId);
          demosLangCode.push(...lang_codedata);
          unMappedQualDatas.push(...unMappedQualData);
          unMappedQualificationSurveys.push("LD" + index.SurveyNumber);
        }
        allStudyQualBundle.push(...bundleNonRangeQualification);
        allStudyAgeQualBundle.push(...bundleRangeQualification);
        allStudyQualOrderBundle.push(...bundleRangeOrder);
      }

      if (allStudyQualBundle.length) {
        upsertStudyDemoDb(allStudyQualBundle);
      }
      if (allStudyAgeQualBundle.length) {
        upsertDemoAgeIntoDb(allStudyAgeQualBundle);
      }
      if (allStudyQualOrderBundle.length) {
        upsertStudyDemoOrder(allStudyQualOrderBundle);
      }
      if (unMappedQualificationSurveys.length) {
        upsertStudyisRouterEligible(unMappedQualificationSurveys.join("','"));
      }
      if (demoUnmaappedSurveyIds.length && demoUnmaappedQualIds.length && demosLangCode.length) {
        upsertIntoUnmappedqualification(demoUnmaappedSurveyIds, demoUnmaappedQualIds, demosLangCode);
      }

    }

    return true;
  } catch (error) {
    console.error("Oops! Something went wrong:", error);
    throw new Error(`Oops! Something went wrong: ${error.message}`);
  }
}

/**
 * Create quota bundle for constraints.
 * @param {object} quotaData - Quota data.
 * @param {string} lang_code - The language code.
 * @param {Array} surveyIndex - Survey index data.
 * @returns {Promise<Array>} A promise that resolves to the quota bundle for constraints.
 */
async function quotaBundle(quotaData, lang_code, surveyIndex) {
  const { SurveyNumber, SurveyQuotas } = quotaData;
  const date = new Date();
  const quotaBundleForConstraints = [];

  const allTotalQuotaData = SurveyQuotas.filter((d) => d.SurveyQuotaType === "Total");
  const allSuvrveyQuotas = SurveyQuotas.filter((d) => d.SurveyQuotaType !== "Total");

  for (const quotaIndex of allSuvrveyQuotas) {
    let RemaningQuota = +((quotaIndex.NumberOfRespondents / allTotalQuotaData[0].NumberOfRespondents) * 100).toFixed(2);
    RemaningQuota = RemaningQuota ? RemaningQuota : 0;
    RemaningQuota = RemaningQuota > 100 ? 70 : RemaningQuota;

    quotaBundleForConstraints.push([
      `LD${SurveyNumber}${quotaIndex.SurveyQuotaID}`, // sqid
      quotaIndex.SurveyQuotaID, // quota Id
      `LD${SurveyNumber}`, // studyId
      "group", // type
      quotaIndex.SurveyQuotaID, // title
      quotaIndex.NumberOfRespondents, // totalQUota
      RemaningQuota, // remaining
      quotaIndex.NumberOfRespondents ? 1 : 0, // isActive
      date, // createdAt
      date, // updatedAt
      lang_code, // lang_code
      `LD${SurveyNumber}${quotaIndex.SurveyQuotaID}`, // apiUniqueQuotaId
    ]);
  }

  return quotaBundleForConstraints;
}

/**
 * Get survey quota demo.
 * @param {Array} getAllZampQuotaIds - All Zamp quota IDs.
 * @param {Array} clientQuotaData - Client quota data.
 * @param {Array} allDBQualificationData - All qualification data.
 * @param {Array} allDbOptions - All options data.
 * @returns {Object} An object containing the quota demo bundle and pause quotas that are unavailable.
 */
async function getSurveyQuotaDemo(getAllZampQuotaIds, clientQuotaData, allDBQualificationData, allDbOptions, insertedQualification) {
  const quotaDemoBundle = [];
  const pauseQuotasUnAvailable = [];
  let allQualNeedToInsertInDb = [];
  // Traverse the all Lucid Surveys Demo Data
  for (const clientQuotaIndex of clientQuotaData) {
    const { SurveyNumber, SurveyQuotas } = clientQuotaIndex;

    if (SurveyQuotas.length === 0 || SurveyQuotas.length === 1) {
      continue;
    }

    let existingSurvey = insertedQualification.find((item) => item.SurveyNumber === SurveyNumber);
    let existingQuestionIds = [];

    if (existingSurvey && existingSurvey.Questions) {
      for (const question of existingSurvey.Questions) {
        existingQuestionIds.push(question.QuestionID);
      }
    }

    for (const quotaIndex of SurveyQuotas) {
      const date = new Date();

      if (!quotaIndex.Questions.length) {
        continue;
      }

      let newQuestionsMap = {};

      for (const question of quotaIndex.Questions) {
        // Skip if this question already exists in DB
        if (existingQuestionIds.includes(question.QuestionID)) {
          continue;
        }

        // If we've seen this question before, merge PreCodes
        if (newQuestionsMap[question.QuestionID]) {
          // Add new PreCodes that don't exist
          for (const preCode of question.PreCodes) {
            if (!newQuestionsMap[question.QuestionID].PreCodes.includes(preCode)) {
              newQuestionsMap[question.QuestionID].PreCodes.push(preCode);
            }
          }
        } else {
          // First time seeing this question, add it
          newQuestionsMap[question.QuestionID] = {
            QuestionID: question.QuestionID,
            PreCodes: [...question.PreCodes], // Make a copy
          };
        }
      }

      let questionsArray = [];
      for (const questionId in newQuestionsMap) {
        questionsArray.push(newQuestionsMap[questionId]);
      }

      // Add to final result if we found new questions
      if (questionsArray.length > 0) {
        allQualNeedToInsertInDb.push({
          SurveyNumber: SurveyNumber,
          Questions: questionsArray,
        });
      }

      let dbQuotaData = getAllZampQuotaIds.filter((d) => d.clientQuotaId == quotaIndex.SurveyQuotaID && d.studyId === "LD" + SurveyNumber);

      // No Quota matched with quotaId and surveyNumber then it will skip the loop
      if (!dbQuotaData.length) {
        pauseQuotasUnAvailable.push(quotaIndex.SurveyQuotaID);
        continue;
      }

      // Traverse the Array of Questions
      quotaIndex.Questions.map((data) => {
        const demographicData = allDBQualificationData.filter((d) => d.lucidQid == data.QuestionID);

        if (!demographicData.length) {
          return;
        }
        // age and zip code
        if (data.QuestionID === 42 || data.QuestionID === 45) {
          if (data.QuestionID === 42) {
            const minAge = Math.min(...data.PreCodes.map(Number));
            const maxAge = Math.max(...data.PreCodes.map(Number));

            quotaDemoBundle.push(["LD" + SurveyNumber, dbQuotaData[0].id, demographicData[0].demographicId, `${dbQuotaData[0].id}${demographicData[0].demographicId}`, `${minAge},${maxAge}`, date, date]);
          } else {
            quotaDemoBundle.push(["LD" + SurveyNumber, dbQuotaData[0].id, demographicData[0].demographicId, `${dbQuotaData[0].id}${demographicData[0].demographicId}`, data.PreCodes.join(","), date, date]);
          }
        } else {
          // non Range Options
          const optionsIds = allDbOptions.filter((obj) => data.PreCodes.includes(obj.lucidOpId.toString()) && demographicData[0]._id === obj.queryId);

          quotaDemoBundle.push(["LD" + SurveyNumber, dbQuotaData[0].id, demographicData[0].demographicId, `${dbQuotaData[0].id}${demographicData[0].demographicId}`, optionsIds.map((d) => d._id).join(","), date, date]);
        }
      });
    }
  }

  return { quotaDemoBundle, pauseQuotasUnAvailable, allQualNeedToInsertInDb };
}

module.exports = { lucidSurveyQuota };
