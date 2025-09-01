const { getAllInsertedQuotas , InsertQuotaDataIntoDb, updateCompleteRequired,insertQuotaDemoIntoDb,pauseUnAvailableQuotas, pauseStudiesIpsos } = require('./model/ipsosModel');
const {getQuotaFromApi} = require('./services/IpsosService');
const {batchPromises} = require('./operation');
// const { lucidSupplyLogs } = require('./lucidLogs')

/**
 * Process Lucid survey quotas.
 * @param {Array} surveyData - Survey data.
 * @param {Array} allDBQualificationData - All qualification data.
 * @param {Array} allDbOptions - All options data.
 * @param {string} lang_code - The language code.
 * @returns {Promise<boolean>} A promise that resolves to true when quotas are processed successfully.
 */
 async function IpsosSurveyQuota(surveyData, allDBQualificationData, allDbOptions, lang_code, surveyAllData) {
    try {
      const allSurveysQuota = [];
      const allSurveyIds = [];
      const allClientQuotaDatas = [];
  
      const processQuotas = async (surveyIndex) => {
        try {
            // const { 0: surveyId } = surveyIndex[16];
            let totalQuota = 0;
            allSurveyIds.push(surveyIndex[16]);
            const SurveyQuota = await getQuotaFromApi(surveyIndex[16]);
            if(SurveyQuota.length){
              totalQuota = +(SurveyQuota[0].remainingShared + SurveyQuota[0].remainingExclusive) || 0;
              let unUsedQuotaData = SurveyQuota.shift();
              allClientQuotaDatas.push(SurveyQuota);
              if(totalQuota > 0){
                const createQuotaBundle = await quotaBundle(SurveyQuota, lang_code, surveyIndex,totalQuota);
                if (createQuotaBundle.length) {
                    allSurveysQuota.push(...createQuotaBundle);
                }
              }
              (totalQuota > 0) ? await updateCompleteRequired(totalQuota, surveyIndex[16]) : await pauseStudiesIpsos(surveyIndex[16]);
             
            }
            
        } catch (error) {
        //   lucidSupplyLogs(JSON.stringify(error), JSON.stringify(surveyId) , 'SurveyQuotas', 0);
          console.error(`Error processing quotas for survey `, error);
          return
        }
    };
    
    // Use Promise.all to execute promises concurrently
    const promises = surveyData.map(processQuotas);
    const batchSize = 2;
      await batchPromises(promises, batchSize);
      if(allSurveysQuota.length > 0){
        await InsertQuotaDataIntoDb(allSurveysQuota);
        const getAllQuotaIds = await getAllInsertedQuotas(allSurveyIds);
        const createQuotaDemoBundle = await getSurveyQuotaDemo(getAllQuotaIds, allClientQuotaDatas, allDBQualificationData, allDbOptions, allSurveyIds);
    
        createQuotaDemoBundle ? await insertQuotaDemoIntoDb(createQuotaDemoBundle.quotaDemoBundle): "";
    
        if (createQuotaDemoBundle && createQuotaDemoBundle.pauseQuotasUnAvailable.length) {
          await pauseUnAvailableQuotas(createQuotaDemoBundle.pauseQuotasUnAvailable);
        }
      }
  
      return true;
    } catch (error) {
      console.error('Oops! Something went wrong:', error);
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
  async function quotaBundle(quotaData, lang_code, surveyId,totalQuota) {
    const SurveyNumber = surveyId[16];
    const date = new Date();
    const quotaBundleForConstraints = [];

    for( const [index, quotaIndex] of quotaData.entries() ) {
      if(quotaIndex.subsampleStatus != 'Live' || quotaIndex.tableName == 'Total Quota') continue;
      let quotaRequired = +(quotaIndex.remainingExclusive + quotaIndex.remainingShared) || 0;
      let quotaPer = +((quotaRequired/totalQuota * 100).toFixed(2));
      quotaPer = quotaPer > 100 ? 70 : quotaPer;
        const quotaId = quotaIndex.quotaId;
      quotaBundleForConstraints.push([
        `IPSOS${SurveyNumber}${quotaId}`, // sqid
        quotaId, // quota Id
        `IPSOS${SurveyNumber}`, // studyId
        'group', // type
        quotaIndex.quotaName, // title
        quotaRequired, // totalQUota
        quotaPer, // remaining
        quotaIndex.subsampleStatus == 'Live' ? 1 : 0, // isActive
        date, // createdAt
        date, // updatedAt
        lang_code, // lang_code
        `IPSOS${SurveyNumber}${quotaId}` // apiUniqueQuotaId
      ]);
    }
  
    return quotaBundleForConstraints;
  }

  async function getSurveyQuotaDemo(getAllZampQuotaIds, clientQuotaData, allDBQualificationData, allDbOptions, allSurveyIds) {
    const quotaDemoBundle = [];
    const pauseQuotasUnAvailable = [];
    const postalCodes = [22234, 13608, 13608, 22241];
  
    for (const [index,clientQuotaIndex ] of clientQuotaData.entries()) {
      let surveyId = allSurveyIds[index];
      for(const questionIndex of clientQuotaIndex){
        const quotaId  = questionIndex.quotaId;
        if (questionIndex.questions.length === 0) {
          continue;
        }
  
        for (const quotaIndex  of questionIndex.questions) {
          const date = new Date();
          let dbQuotaData = getAllZampQuotaIds.filter(d => d.clientQuotaId == quotaId && allSurveyIds.includes(Number(d.studyId.replace('IPSOS', ''))));

          // No Quota matched with quotaId and surveyNumber then it will skip the loop
          if (!dbQuotaData.length) {
            pauseQuotasUnAvailable.push(quotaId);
            continue;
          }
          surveyId = dbQuotaData[0].studyId;
          
          // Traverse the Array of Questions 
          // quotaIndex..map((data) => {
            const demographicData = allDBQualificationData.filter((d) => d.ipsosQid == quotaIndex.id );
              
            if (!demographicData.length) {
              continue;
            }
              // age and zip code 
            if (quotaIndex.id == '-1' || postalCodes.includes(quotaIndex.id)) {
              if (quotaIndex.id == '-1') {                
                const minAge = quotaIndex.answers[0].rangeStart;
                const maxAge = quotaIndex.answers[0].rangeEnd;
    
                quotaDemoBundle.push([
                  surveyId,
                  dbQuotaData[0].id,
                  demographicData[0].demographicId,
                  `${dbQuotaData[0].id}${demographicData[0].demographicId}`,
                  `${minAge},${maxAge}`,
                  date,
                  date,
                ]);
              } else {
                const postalCodes = quotaIndex.answers.map(i =>  i.id);
                quotaDemoBundle.push([
                  surveyId,
                  dbQuotaData[0].id,
                  demographicData[0].demographicId,
                  `${dbQuotaData[0].id}${demographicData[0].demographicId}`,
                  postalCodes.join(","),
                  date,
                  date,
                ]);
              }
            } else {
              // non Range Options
              const optionsIds = allDbOptions.filter((obj) => quotaIndex.answers.some(obj2 => obj2.id == obj.ipsosOid ) && demographicData[0]._id === obj.queryId);
              if(optionsIds.length){
                quotaDemoBundle.push([
                  surveyId,
                  dbQuotaData[0].id,
                  demographicData[0].demographicId,
                  `${dbQuotaData[0].id}${demographicData[0].demographicId}`,
                  optionsIds.map((d) => d._id).join(','),
                  date,
                  date,
                ]);
              }else{
                pauseQuotasUnAvailable.push(quotaId);
              }
            
            }
          // });
        }
      }
    }
  
    return { quotaDemoBundle, pauseQuotasUnAvailable };
  }

  module.exports= {IpsosSurveyQuota}