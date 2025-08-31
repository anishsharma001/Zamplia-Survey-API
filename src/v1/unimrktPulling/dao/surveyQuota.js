const { pauseUnAvailableQuotas, getAllInsertedQuotas , insertQuotaDemoIntoDb, InsertQuotaDataIntoDb } = require('./getDemosFromZamplia');



 async function unimarketQuota(clientQuotaDatas, allDBQualificationData, allDbOptions, lang_code) {
    try {
      const allSurveysQuota = [];
      const allSurveyIds = [];
  
      const processQuotas = async (surveyIndex) => {        
        if (surveyIndex && surveyIndex.surveyId) {
          allSurveyIds.push(surveyIndex.surveyId);        
        }
        if (surveyIndex && typeof surveyIndex === 'object' && surveyIndex.hasOwnProperty("quotas") && surveyIndex.quotas.length) {
          const createQuotaBundle = await quotaBundle(lang_code, surveyIndex.surveyId,surveyIndex.quotas,surveyIndex.total_remaining);
          if (createQuotaBundle.length) {
            allSurveysQuota.push(...createQuotaBundle);
          }
        }
          
      };
  
      // const promises = clientQuotaDatas.map(processQuotas);      
      // const batchSize = 1;
      // await batchPromises(promises, batchSize);
      for (const surveyIndex of clientQuotaDatas) {
        await processQuotas(surveyIndex);
      }

      if(allSurveysQuota.length){
        await InsertQuotaDataIntoDb(allSurveysQuota);
      }
      
      const getAllQuotaIds = await getAllInsertedQuotas(allSurveyIds);
      const createQuotaDemoBundle = await getSurveyQuotaDemo(getAllQuotaIds, clientQuotaDatas, allDBQualificationData, allDbOptions);
      if(createQuotaDemoBundle.quotaDemoBundle.length){
        await insertQuotaDemoIntoDb(createQuotaDemoBundle.quotaDemoBundle);
      }
  
      if (createQuotaDemoBundle.pauseQuotasUnAvailable.length) {
        await pauseUnAvailableQuotas(createQuotaDemoBundle.pauseQuotasUnAvailable);
      }
  
      return true;
    } catch (error) {
      console.error('Oops! Something went wrong:', error);
      return (`Oops! Something went wrong: ${error.message}`);
    }
  }
  
  async function quotaBundle( lang_code,surveyId, surveyQuota,total_remaining) {
    const date = new Date();
    const quotaBundleForConstraints = [];
    for (const quota of surveyQuota) {
      let RemaningQuota = +((quota.remaining / total_remaining) * 100).toFixed(2);
      RemaningQuota = RemaningQuota ? RemaningQuota : 0;
      RemaningQuota = RemaningQuota > 100 ? 70 : RemaningQuota;
      quotaBundleForConstraints.push([
        `UMT${surveyId}${quota.quotaId}`, // sqid
        `${quota.quotaId}`, // quota Id
        `UMT${surveyId}`, // studyId
        'group', // type
        quota.quotaId, // title
        quota.remaining, //totalQuota
        RemaningQuota, //remaining
        quota.remaining ? 1 : 0, // isActive
        date, // createdAt
        date, // updatedAt
        lang_code, // lang_code
        `UMT${surveyId}${quota.quotaId}`
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
  async function getSurveyQuotaDemo(getAllZampQuotaIds, clientQuotaData, allDBQualificationData, allDbOptions) {
    const quotaDemoBundle = [];
    const pauseQuotasUnAvailable = [];
  
    // Traverse the all Lucid Surveys Demo Data
    for (const clientQuotaIndex of clientQuotaData) {
      if (clientQuotaIndex.surveyId && clientQuotaIndex.quotas) {
        const { surveyId, quotas } = clientQuotaIndex;  
        if (quotas.length === 0 || quotas.length === 1) {
          continue;
        }
  
        for (const quotaIndex of quotas) {
          const date = new Date();
    
          if (!quotaIndex.conditions.length) {
            continue;
          }
          
          // if(getAllZampQuotaIds.length) {}
          let dbQuotaData = getAllZampQuotaIds.filter( d => d.clientQuotaId == quotaIndex.quotaId && d.studyId === "UMT"+surveyId);

          // No Quota matched with quotaId and surveyNumber then it will skip the loop
          if (!dbQuotaData.length) {
            pauseQuotasUnAvailable.push(quotaIndex.quotaId);
            continue;
          }
          
          // Traverse the Array of conditions 
          quotaIndex.conditions.map((data) => {
            
            const demographicData = allDBQualificationData.filter((d) => d.unimrktQid == data.questionId);
            if (!demographicData.length) {
              return;
            }
              // age and zip code 
              if (data.questionId == 1001|| data.questionId == 1085 ) {
                if (data.questionId == 1001) {
                // const minAge = Math.min(...data.options.map(Number));
                // const maxAge = Math.max(...data.options.map(Number));
                let minAge = '';
                let maxAge = '';                            
                let optionsId = data.options.map(o => o);
                  if (optionsId.length) {
                    optionsId = optionsId.map(range => {
                      [minAge, maxAge] = range.split('-').map(Number);
                      return { minAge, maxAge };
                  });
                  } else {
                    [minAge, maxAge] = optionsId[0].split('-').map(Number);
                  }
                quotaDemoBundle.push([
                  "UMT" +surveyId,
                  dbQuotaData[0].id,
                  demographicData[0].demographicId,
                  `${dbQuotaData[0].id}${demographicData[0].demographicId}`,
                  `${minAge}-${maxAge}`,
                  date,
                  date,
                ]);
              } else {
                quotaDemoBundle.push([
                  "UMT" +surveyId,
                  dbQuotaData[0].id,
                  demographicData[0].demographicId,
                  `${dbQuotaData[0].id}${demographicData[0].demographicId}`,
                  data.options.join(','),
                  date,
                  date,
                ]);
              }
            } else {
              // non Range Options
              const optionsIds = allDbOptions.filter((obj) => data.options.includes(obj.unimrktOid.toString()) && demographicData[0]._id === obj.queryId);
    
              quotaDemoBundle.push([
                "UMT" +surveyId,
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
    }
  
    return { quotaDemoBundle, pauseQuotasUnAvailable };
  }
  
  

module.exports={unimarketQuota}
