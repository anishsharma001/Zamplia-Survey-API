const { pauseUnAvailableQuotas, getAllInsertedQuotas, insertQuotaDemoIntoDb, InsertQuotaDataIntoDb } = require('./comman');
const { getQuotaFromMCQ } = require('./services');

async function MCQSurveyQuota(surveyData, allDBQualificationData, allDbOptions, allLangCode) {
  try {
    const allSurveysQuota = [];
    const allSurveyIds = [];
    const allClientQuotaDatas = [];
    let langSurveyData = [];

    const processQuotas = async (surveyIndex) => {
      try {
        const surveyId = surveyIndex.SurveyId;
        allSurveyIds.push(surveyId);
        const clientQuotaData = await getQuotaFromMCQ(surveyId);
        if (clientQuotaData.hasOwnProperty("SurveyQuotas") && clientQuotaData.SurveyQuotas.length > 1) {
          let langCode = allLangCode.filter(item => item.marketCubeId == surveyIndex.LanguageId).map(d => d.lang_code).join("");
          allClientQuotaDatas.push(clientQuotaData);
          langSurveyData.push({ surveyId, langCode })
          const createQuotaBundle = await quotaBundle(clientQuotaData, langCode, surveyIndex);
          if (createQuotaBundle.length) {
            allSurveysQuota.push(...createQuotaBundle);
          }
        }
      } catch (error) {
        
        console.error(`Error processing quotas for survey ${surveyId}:`, error);
        return
      }
    };

   
    const promises = surveyData.map(processQuotas);
    const batchSize = 2;
    await batchPromises(promises, batchSize);

    if(allSurveysQuota.length){
    await InsertQuotaDataIntoDb(allSurveysQuota);
    }

    const getAllQuotaIds = await getAllInsertedQuotas(allSurveyIds);
    const createQuotaDemoBundle = await getSurveyQuotaDemo(getAllQuotaIds, allClientQuotaDatas, allDBQualificationData, allDbOptions, langSurveyData);

    if(createQuotaDemoBundle.quotaDemoBundle.length){
    await insertQuotaDemoIntoDb(createQuotaDemoBundle.quotaDemoBundle);
    }


    if (createQuotaDemoBundle.pauseQuotasUnAvailable.length) {
      await pauseUnAvailableQuotas(createQuotaDemoBundle.pauseQuotasUnAvailable);
    }

    return true;
  } catch (error) {
    console.error('Oops! Something went wrong:', error);
    throw new Error(`Oops! Something went wrong: ${error.message}`);
  }
}

async function quotaBundle(quotaData, lang_code, surveyIndex) {
  const { SurveyId, SurveyQuotas } = quotaData;
  const date = new Date();
  const quotaBundleForConstraints = [];

  const allTotalQuotaData = SurveyQuotas.filter((d) => d.Name === 'Total');
  const allSuvrveyQuotas = SurveyQuotas.filter((d) => d.Name !== 'Total');
  const checkQuotaRequirement = allTotalQuotaData.filter(item => item.TotalRemaining > 5);
  if (!checkQuotaRequirement.length) {
    return []
  }
  for (const quotaIndex of allSuvrveyQuotas) {
    let RemaningQuota = +((quotaIndex.TotalRemaining / allTotalQuotaData[0].TotalRemaining) * 100).toFixed(2);
    RemaningQuota = RemaningQuota ? RemaningQuota : 0;
    RemaningQuota = RemaningQuota > 100 ? 70 : RemaningQuota;

    quotaBundleForConstraints.push([
      `MCQ${SurveyId}${quotaIndex.QuotaId}`, // sqid
      quotaIndex.QuotaId, // quota Id
      `MCQ${SurveyId}`, // studyId
      'group', // type
      quotaIndex.QuotaId, // title
      quotaIndex.TotalRemaining, // totalQUota
      RemaningQuota, // remaining
      quotaIndex.TotalRemaining ? 1 : 0, // isActive
      date, // createdAt
      date, // updatedAt
      lang_code, // lang_code
      `MCQ${SurveyId}${quotaIndex.QuotaId}` // apiUniqueQuotaId
    ]);
  }

  return quotaBundleForConstraints;
}

async function getSurveyQuotaDemo(getAllZampQuotaIds, clientQuotaData, allDBQualificationData, allDbOptions, allLangCode) {
  const quotaDemoBundle = [];
  const pauseQuotasUnAvailable = [];
  const postalCodes = [17365, 2081, 636, 17619, 4595];

  // Traverse the all Lucid Surveys Demo Data
  for (const clientQuotaIndex of clientQuotaData) {
    const { SurveyId, SurveyQuotas } = clientQuotaIndex;
    const lang_Code = allLangCode.filter(item => item.surveyId == SurveyId).map(d => d.langCode).join("");
    if (SurveyQuotas.length === 0 || SurveyQuotas.length === 1) {
      continue;
    }

    for (const quotaIndex of SurveyQuotas) {
      const date = new Date();

      if (!quotaIndex.Conditions.length) {
        continue;
      }

      let dbQuotaData = getAllZampQuotaIds.filter(d => d.clientQuotaId == quotaIndex.QuotaId && d.studyId === "MCQ" + SurveyId);

      // No Quota matched with quotaId and surveyNumber then it will skip the loop
      if (!dbQuotaData.length) {
        pauseQuotasUnAvailable.push(quotaIndex.QuotaId);
        continue;
      }

      // Traverse the Array of Questions 
      quotaIndex.Conditions.map((data) => {
        const demographicData = allDBQualificationData.filter((d) => d.mcqQid == data.QualificationId && d.lang_code == lang_Code);

        if (!demographicData.length) {
          return;
        }
        // age and zip code 
        if (data.QualificationId === 59 || data.QualificationId === 143) {
          if (data.QualificationId === 59) {
            let ages = data.AnswerIds[0].split("-");
            const minAge = Number(ages[0]);
            const maxAge = Number(ages[1]);

            quotaDemoBundle.push([
              "MCQ" + SurveyId,
              dbQuotaData[0].id,
              demographicData[0].demographicId,
              `${dbQuotaData[0].id}${demographicData[0].demographicId}`,
              `${minAge},${maxAge}`,
              date,
              date,
            ]);
          } else {
            quotaDemoBundle.push([
              "MCQ" + SurveyId,
              dbQuotaData[0].id,
              demographicData[0].demographicId,
              `${dbQuotaData[0].id}${demographicData[0].demographicId}`,
              data.AnswerIds.join(','),
              date,
              date,
            ]);
          }
        } else {
          // non Range Options
          const optionsIds = allDbOptions.filter((obj) => data.AnswerCodes.includes(obj.mcqOpId.toString()) && demographicData[0]._id === obj.queryId);

          quotaDemoBundle.push([
            "MCQ" + SurveyId,
            dbQuotaData[0].id,
            demographicData[0].demographicId,
            `${dbQuotaData[0].id}${demographicData[0].demographicId}`,
            optionsIds.map((d) => d._id).join(','),
            date,
            date,
          ]);
        }
      });
    }
  }

  return { quotaDemoBundle, pauseQuotasUnAvailable };
}

async function batchPromises(promises, batchSize) {
  const results = [];

  for (let i = 0; i < promises.length; i += batchSize) {
    const batch = promises.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((promise) => promise));
    results.push(...batchResults);
  }

  return results;
}

module.exports = { MCQSurveyQuota }