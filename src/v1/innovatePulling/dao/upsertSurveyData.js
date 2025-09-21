const saveRecord = require('../../common/insertRecords');
const { executeDev7 } = require('../../../database/queryWrapperMysql');
const getAllSurveyQuotaFromDb = require('./getAllSurveyQuota');
const upsertSurveyTargeting = require('../dao/upsertSurveyQuotaTargeting.js')

async function upsertSurveyScreener(id, body, langCode, zampliaDemos) {
    return new Promise(async (resolve, reject) => {
        let date = new Date();
        let upsertSurveyScreener = []
        let upsertAgeSurveyScreener = []
        const allStudyQualOrderBundle=[];
        let unmappedSuveyId=[];
        let unmappedQualificationids=[];
        let demographicId = ''
        let studyId = `INN${id}`;
        let sqId = ''
        let queryId = '';
        for (let i = 0; i < body.length > 0; i++) {
            //AGE || ZIPCODE
            if (body[i].QuestionId == 1 || body[i].QuestionId == 3) {
                sqId = studyId + body[i].QuestionId;
                if (body[i].QuestionId == 1) {
                    let age = []
                    demographicId = '1520196Demo1563257915329';
                    if (langCode == 'En-US') {
                        queryId = '151520196Demo15632579153296query1563258313059'
                    }
                    for (let dd = 0; dd < body[i].Options.length; dd++) {
                        age.push(body[i].Options[dd].ageStart)
                        age.push(body[i].Options[dd].ageEnd)
                    }
                    upsertAgeSurveyScreener.push([sqId, studyId, demographicId, queryId, Math.max(...age), Math.min(...age),
                        date, date, langCode, sqId
                    ])
                    allStudyQualOrderBundle.push([studyId,
                        demographicId,
                        i+1, date, date,
                        langCode,sqId
                    ])
                } else {
                    // zip code
                    demographicId = '620196Demo1562404395959';
                    if (langCode == 'En-US') {
                        queryId = '6620196Demo15624043959596query1562404421694'
                    }
                    const allText = body[i].Options.map(option => option.OptionText).join(',');
                    upsertSurveyScreener.push([sqId, studyId, demographicId, queryId, '', allText,
                        date, date, langCode, sqId
                    ])
                    allStudyQualOrderBundle.push([studyId,
                        demographicId,
                        i+1, date, date,
                        langCode,sqId
                    ])
                }
            } else {
                // sdm - id, studyId, demographicId, queryId, optionId, allText, createdAt, updatedAt, lang_code, isRandomized, excludedOptions, demoId, zipFile, isArchived, archivedAt, isActive, isFSA
                let demoOptions = []
                let filterQual = zampliaDemos.option.filter(d =>
                    d.innovateQid == body[i].QuestionId
                )
                if(filterQual.length == 0){
                    unmappedSuveyId.push(id);
                    unmappedQualificationids.push(body[i].QuestionId);
                    continue
                }
                sqId = studyId + body[i].QuestionId;
                if (filterQual.length > 0) {
                    [demographicId, queryId] = [filterQual[0].demographicId, filterQual[0].demoqueryId];
                    for (let dd = 0; dd < body[i].Options.length; dd++) {
                        let demoOptionIds = filterQual.filter(x =>
                            x.innovateOid == body[i].Options[dd].OptionId
                        )
                        let optionsId = demoOptionIds.length > 0 ? demoOptionIds[0].queryoptionId : "";
                        demoOptions.push(optionsId);
                    }
                    demoOptions = demoOptions.join(',');
                    upsertSurveyScreener.push([sqId, studyId, demographicId, queryId, demoOptions, '',
                        date, date, langCode, sqId
                    ])
                    allStudyQualOrderBundle.push([studyId,
                        demographicId,
                        i+1, date, date,
                        langCode,sqId
                    ])
                }
            }
        }
        if (upsertSurveyScreener.length > 0) {
            let queryDemo = `insert into studydemomapping(sqid, studyId, demographicId, queryId, optionId, allText, createdAt, updatedAt, lang_code, apiUniqueId) values ? ON 
                DUPLICATE KEY UPDATE demographicId=values(demographicId), queryId=values(queryId),  optionId=values(optionId), allText=values(allText), updatedAt=(updatedAt),lang_code=values(lang_code)`;
            await saveRecord.insertRecord(queryDemo, upsertSurveyScreener);
        }

        if (upsertAgeSurveyScreener.length > 0) {
            let queryDemo = `insert into demoagemapping(sqid, studyId, demographicId, queryId, ageTo, ageFrom, createdAt, updatedAt, lang_code, apiUniqueId) values ? ON 
            DUPLICATE KEY UPDATE demographicId=values(demographicId), queryId=values(queryId), ageTo=values(ageTo), ageFrom=values(ageFrom), updatedAt=(updatedAt),lang_code=values(lang_code)`;
            await saveRecord.insertRecord(queryDemo, upsertAgeSurveyScreener);
        }
        if(allStudyQualOrderBundle.length > 0) {
          await upsertStudyScreenerOrder(allStudyQualOrderBundle);
        }
        if(unmappedSuveyId.length > 0 && unmappedQualificationids.length > 0){
          await  upsertIntoUnmappedqualification(unmappedSuveyId, unmappedQualificationids, langCode);
        }
        if (unmappedSuveyId.length > 0) {
            let unMappedSuverydata=unmappedSuveyId.map((d)=>`INN${d}`);
             await upsertStudyisRouterEligible(unMappedSuverydata);
        }
        resolve(true);
    })
}

async function upsertSurveyQuota(surveyId, SurveyQuota, langCode, zampliaDemos, allSurveyIds) {
    return new Promise(async (resolve, reject) => {
        let date = new Date();
        let surveyQuota = SurveyQuota;
        let quota = [];
        for (let index in surveyQuota) {
            let quotaStatus = surveyQuota[index].quotaStatus == 'Open' ? 1 : 0;
            quota.push([
                surveyQuota[index].id + 'INN' + surveyId,
                surveyQuota[index].id,
                'INN' + surveyId,
                'group',
                surveyQuota[index].title,
                surveyQuota[index].quotaN,
                surveyQuota[index].RemainingN,
                date,
                date,
                langCode,
                quotaStatus,
                surveyQuota[index].id + 'INN' + surveyId
            ])
            let queryDemo = `insert into constrainsts(sqid, clientQuotaId, studyId, type, title, totalQuota, 
                requirement, createdAt, updatedAt, lang_code, isActive, apiUniqueQuotaId) values ? ON 
                DUPLICATE KEY UPDATE title=values(title), totalQuota=values(totalQuota), requirement=values(requirement),updatedAt=(updatedAt),lang_code=values(lang_code), isActive = values(isActive)`;
                if(quota.length){
                    await saveRecord.insertRecord(queryDemo, quota);
                }
            upsertSurveyTargeting.upsertSurveyQuotaTargeting(surveyId, SurveyQuota, langCode, zampliaDemos, allSurveyIds);
            
        }
    })
}

async function upsertStudyScreenerOrder(data) {
    try {
      const queryDemo = `insert into projectscreenerorder(studyId, screener_id, order_no, createdAt, updatedAt, lang_code, apiUniqueId) values ? ON 
      DUPLICATE KEY UPDATE studyId=values(studyId), screener_id=values(screener_id), order_no=values(order_no), updatedAt=(updatedAt),lang_code=values(lang_code)`;
      const resultDemo = await saveRecord.insertRecord(queryDemo, data);
      return resultDemo;
    } catch (error) {
      throw new Error(`Oops Something went wrong: ${error.message}`);
    }
  }

  async function upsertIntoUnmappedqualification(unMappedSurveyIds, unMappedQuals, lang_Code) {
    try {
      const clientId = 25;
      const dataBundle = [];
      const surveyMap = {};
  
      // Group qualifications by surveyId
      for (let i = 0; i < unMappedSurveyIds.length; i++) {
        const surveyId = unMappedSurveyIds[i];
        const qualification = unMappedQuals[i];
        if (!surveyMap[surveyId]) {
          surveyMap[surveyId] = [];
        }
        surveyMap[surveyId].push(qualification);
      }
      // Prepare data bundle
      for (const surveyId in surveyMap) {
        const qualifications = surveyMap[surveyId].join(',');  // Join qualifications with commas
        dataBundle.push([`INN${surveyId}`, clientId, qualifications, lang_Code, new Date()]);
      }
      const query = `
        INSERT INTO unmapped_api_quals (sid, cid, qualification_id, lang_code, created_at)
        VALUES ? 
        ON DUPLICATE KEY UPDATE 
          qualification_id = VALUES(qualification_id),
          lang_code = VALUES(lang_code),
          created_at = VALUES(created_at)
      `;
      const resultResponse = await executeDev7(query, [dataBundle]);
      return resultResponse;
    } catch (error) {
      return `Oops! Something went wrong: ${error.message}`;
    }
  }
  async function upsertStudyisRouterEligible(studyIds) {
    try {
      if (!Array.isArray(studyIds) || studyIds.length === 0) {
        return []
      }
      // Generate placeholders (?, ?, ?...) dynamically based on studyIds length
      const placeholders = studyIds.map(() => '?').join(', '); 
      const query = `UPDATE studies SET isRouterEligible = 1 WHERE _id IN (${placeholders})`;
      const response = await executeDev7(query, studyIds);
      return response;
    } catch (error) {
      console.error("Error in upsertStudyisRouterEligible:", error);
      return [];
    }
  }
module.exports = { upsertSurveyScreener, upsertSurveyQuota }