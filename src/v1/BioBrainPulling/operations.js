const {getSurveyQuals, getSurveyQuata} = require('./NetworkService')
const { insertStudyDemoMapping, insertStudyDemoAgeMapping, updateRequirement, getAllInsertedQuotas, InsertQuotaDataIntoDb, insertQuotaDemoIntoDb, pauseUnAvailableQuotas ,upsertIntoUnmappedqualification,upsertStudyisRouterEligible} = require('./dao');



async function createSuveyBundle(data, lang_code) {
    let surveyDataBundle = [];
    // let surveyDataBundleAllocation = [];
    let surveyIds = [];
    let surveyWithQuota = [];
    let surveyWithGroup = [];
    // let BulkSurveyData = [];
    // let BulkSurveyAllocationData = [];
  
    for (let surveyIndex of data) {
      // var surveyEndDate = new Date();
      surveyIndex.status = 'Live';
      let devices = "Both";
      if(surveyIndex.DesktopAllowed && (surveyIndex.MobileAllowed && surveyIndex.TabletAllowed)){
        devices = "Both";
      }else if(surveyIndex.DesktopAllowed && (!surveyIndex.MobileAllowed && !surveyIndex.TabletAllowed)){
        devices = "Desktop";
      }else if(!surveyIndex.DesktopAllowed && (surveyIndex.MobileAllowed && surveyIndex.TabletAllowed)){
        devices = "Mobile";
      }
      // surveyEndDate.setDate(surveyEndDate.getDate() + 15);
      let studyId = `BB${surveyIndex.SurveyId}`
      surveyIds.push(surveyIndex.SurveyId);
      if (surveyIndex.Has_Quotas) {
        surveyWithQuota.push(surveyIndex.SurveyId)
      }
      if (surveyIndex.Has_Survey_Groups) {
        surveyWithGroup.push(surveyIndex.SurveyId)
      }
      surveyDataBundle.push(
        [
          studyId,
          surveyIndex.Name.substring(0, 50), surveyIndex.Name,
          surveyIndex.Completes,
          surveyIndex.SurveyUrl,
          null,
          surveyIndex.Cpi,
          "Live",
          surveyIndex.Loi,
          surveyIndex.Ir,
          1, 1, lang_code, lang_code, 43, 43,
          surveyIndex.SurveyId,
          surveyIndex.EndDate,
          devices, 1, surveyIndex.Has_Survey_Groups ? 1 : 0, 0, surveyIndex.CollectPii, "ADHOC",
          0, 100, 4, 30,surveyIndex.BuyerId,0
        ]
      );
  
    }
    return [surveyDataBundle, surveyIds, surveyWithQuota, surveyWithGroup];
  }


  async function insertQuals(allQualifications, allOptions, surveyBundleData, lang_Code) {
    try {
      let demoMappingBundle = [];
      let demoAgeMappingBundle = [];
      let unMapeedQuals = [];
      let unMappedSuveryId=[];
      // Convert allQualifications to a Map for quick lookup
      const qualificationsMap = new Map(allQualifications.map(item => [item.mcqQid, item]));
  
      // Convert allOptions to a Map for quick lookup
      const optionsMap = new Map(allOptions.map(item => [item.marketCubeOid, item._id]));
  
      // Store all promises
      const surveyPromises = surveyBundleData.map(async (survey) => {
          let surveyQuals = await getSurveyQuals(survey);
  
          if (surveyQuals.success && surveyQuals.result) {
              const studyDemo = surveyQuals.result;
  
              studyDemo.forEach(({ QualificationId, SurveyId, OptionIds }) => {
                  const queryData = qualificationsMap.get(QualificationId);
                  
                  if (!queryData) {
                      unMapeedQuals.push(QualificationId);
                      unMappedSuveryId.push(SurveyId);
                      return;
                  }
  
                  let sqId = `BB${SurveyId}${QualificationId}`;
                  let currentDate = new Date();
                  let mappingData;
  
                  if (QualificationId === 59) { // Age demographic
                      let [start, end] = OptionIds[0].split('-');
                      mappingData = [`BB${SurveyId}`, queryData.demographicId, queryData._id, start, end, lang_Code, currentDate, currentDate, sqId,sqId];
                      demoAgeMappingBundle.push(mappingData);
                  } else if (QualificationId === 143) { // Zip
                      let optionsData = OptionIds.join(',');
                      mappingData = [`BB${SurveyId}`, queryData.demographicId, queryData._id, '', optionsData, lang_Code, currentDate, currentDate, sqId,sqId];
                      demoMappingBundle.push(mappingData);
                  } else { // Other demographics
                      let optionsData = OptionIds
                          .map(id => optionsMap.get(id))
                          .filter(Boolean)
                          .join(',');
                      mappingData = [`BB${SurveyId}`, queryData.demographicId, queryData._id, optionsData, "", lang_Code, currentDate, currentDate, sqId,sqId];
                      demoMappingBundle.push(mappingData);
                  }
              });
          }
      });
  
      // Execute all the promises concurrently
      await Promise.all(surveyPromises);
  
      
      if (demoAgeMappingBundle.length) {
          await insertStudyDemoAgeMapping(demoAgeMappingBundle);
      }
      
      if (demoMappingBundle.length) {
          await insertStudyDemoMapping(demoMappingBundle);
      }
      if (unMapeedQuals.length && unMappedSuveryId.length) {
        await upsertIntoUnmappedqualification(unMappedSuveryId,unMapeedQuals,lang_Code);
         }
         if(unMappedSuveryId.length){
          let unMappedSuverydata=unMappedSuveryId.map((d)=>`BB${d}`);
          await upsertStudyisRouterEligible(unMappedSuverydata);
          // await logsUnMappedQualData(unMappedQualDatas)
        }
  
      return
    } catch (error) {
      return
    }
  }


  async function insertQuotas(allQualifications, allOptions, surveyBundleData, lang_Code) {
    try {
      let allSurveyIds = surveyBundleData[1];
      let totalQuota = 0;
      let allClientQuotaData = [];
      let allSurveyQuotas = [];
    
  
      // Map all survey processing to an array of promises
      const surveyPromises = allSurveyIds.map(async (surveyId) => {
          let surveyQuota = await getSurveyQuata(surveyId);
  
          if (surveyQuota && surveyQuota.result.length) {
              totalQuota += surveyBundleData[0][0][3];
              allClientQuotaData.push(...surveyQuota.result);
  
              const createQuotaBundle = await quotaBundle(surveyQuota, lang_Code, totalQuota, surveyId);
              if (createQuotaBundle.length) {
                  allSurveyQuotas.push(...createQuotaBundle);
              }
  
              if (totalQuota > 0) {
                  await updateRequirement(totalQuota, surveyId);
              }
          }
      });
      
       let createQuotaDemoBundle;
      // Execute all survey promises concurrently
      await Promise.all(surveyPromises);
       if(allSurveyQuotas.length){
        await InsertQuotaDataIntoDb(allSurveyQuotas);
        const getAllQuotaIds = await getAllInsertedQuotas(allSurveyIds);
        createQuotaDemoBundle = await getSurveyQuotaDemo(getAllQuotaIds, allClientQuotaData, allQualifications, allOptions);
  
        createQuotaDemoBundle ? await insertQuotaDemoIntoDb(createQuotaDemoBundle.quotaDemoBundle) : "";
       }
        
       if (createQuotaDemoBundle && createQuotaDemoBundle.pauseUnavailableQuotas.length) {
          await pauseUnAvailableQuotas(createQuotaDemoBundle.pauseUnavailableQuotas);
        }
  
      return true;
  
    } catch (error) {
      return;
    }
  }

  async function quotaBundle(quotaData, lang_Code, totalQuota, surveyId) {
    let SurveyId = surveyId;
    const date = new Date();
    const quotaBundleForConstraints = [];
  
    for (let index = 0; index < quotaData.result.length; index++) {
      let quotaIndex = quotaData.result[index];
      let quotaRequired = +(quotaIndex.SampleNumber);
      let quotaPer = +((quotaRequired / totalQuota * 100).toFixed(2));
      quotaPer = quotaPer > 100 ? 70 : quotaPer;
      let quotaId = quotaIndex.QuotaId;
      quotaBundleForConstraints.push([
        `BB${surveyId}${quotaId}`,//sqid
        quotaId,
        `BB${surveyId}`,
        'group',
        quotaIndex.QuotaName,
        quotaRequired,
        quotaPer,
        1,
        date, date,
        lang_Code,
        `BB${surveyId}${quotaId}`
      ]);
    }
  
    return quotaBundleForConstraints;
  
  }

  async function getSurveyQuotaDemo(getAllQuotaIds, clientQuotaData, allDbQualifications, allDbOptions) {
    const quotaDemoBundle = [];
    const pauseUnavailableQuotas = [];
    
    for (let index = 0; index <  clientQuotaData.length; index++) {
      let quotaDemo = clientQuotaData[index];
      const quotaId = quotaDemo.QuotaId;
      const date = new Date();
  
      for (let quotaIndex of quotaDemo.Conditions) {
        let DbQuotaData = getAllQuotaIds.filter((d) => d.clientQuotaId == quotaId );
        if (!DbQuotaData.length) {
          pauseUnavailableQuotas.push(quotaId);
          continue;
        }
        const demographicData = allDbQualifications.filter((d) => d.mcqQid == quotaIndex.QualificationId);
        if (!demographicData.length) {
          continue;
        }
  
        if (quotaIndex.QualificationId == 59 || quotaIndex.QualificationId == 143) {
          if (quotaIndex.QualificationId == 59) {
            const ages = quotaIndex.OptionCodes[0].split('-');
            const minAge = Number(ages[0]);
            const maxAge = Number(ages[1]);
  
            quotaDemoBundle.push([
              DbQuotaData[0].studyId,
              DbQuotaData[0].id,
              demographicData[0].demographicId,
              `${DbQuotaData[0].id}${demographicData[0].demographicId}`,
              `${minAge},${maxAge}`,
              date, date
            ]);
          } else {
            quotaDemoBundle.push([
              DbQuotaData[0].studyId,
              DbQuotaData[0].id,
              demographicData[0].demographicId,
              `${DbQuotaData[0].id}${demographicData[0].demographicId}`,
              quotaIndex.OptionCodes[0],
              date, date
            ])
          }
        } else {
          const optionIds = allDbOptions.filter((obj) => quotaIndex.OptionIds.some(obj2 => obj2 == obj.marketCubeOid && demographicData[0]._id == obj.queryId));
          if (optionIds.length) {
            quotaDemoBundle.push([
              DbQuotaData[0].studyId,
              DbQuotaData[0].id,
              demographicData[0].demographicId,
              `${DbQuotaData[0].id}${demographicData[0].demographicId}`,
              optionIds.map((d) => d._id).join(','),
              date, date
            ])
          } else {
            pauseUnavailableQuotas.push(quotaId);
          }
        }
      }
    }
    return { quotaDemoBundle, pauseUnavailableQuotas };
  }


  module.exports = {
    createSuveyBundle : createSuveyBundle,
    insertQuals : insertQuals,
    insertQuotas : insertQuotas
  }