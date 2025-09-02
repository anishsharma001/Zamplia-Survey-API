const {executeDev7} = require('../../../database/queryWrapperMysql');
const redis = require('../../../middlewares/redisClient');
const meta = require('../../../config/meta.json');
async function getAllOptionsFromDb(lang_code) {
  try {
    const query = 'select * from queryoptions where lang_code = ? and unimrktOid is not null';
    const ALL_CACHED_QUALIFICATION = { key: 'getAllUnimrktOption_cachee', expiry: meta.noExpire };
    const result = await redis.getData(ALL_CACHED_QUALIFICATION, query, [lang_code], { lang_code });
    // const result  = await executeDev7(query, [lang_code]);
    return result;
  } catch (error) {
    return (`Oops Something went wrong: ${error.message}`);
  }
}

async function getAllQualificationFromDb(lang_code) {
  try {
    const query = `select * from demoquery where lang_code = ? and unimrktQid is not null;`;
    const ALL_CACHED_QUALIFICATION = { key: 'getAllUnimrktQualificationDatas', expiry: meta.noExpire };
    const result = await redis.getData(ALL_CACHED_QUALIFICATION, query, [lang_code], { lang_code });
    // const result  = await executeDev7(query, [lang_code]);
    return result;
  } catch (error) {
    return (`Oops Something went wrong: ${error.message}`);
  }
}

async function existingMappings(lang_code){
  try{
    const query = `select unimrktQid from demoquery where lang_code = ? and unimrktQid is not null; `;
    const response = await executeDev7(query,[lang_code]);
    const unimrktQid = response.map(item => item.unimrktQid);   
    return unimrktQid;
  }catch(error){
    return [];
  }
}

async function upsertStudyDemoDb(data) {
  try {
    const query = `insert into studydemomapping(sqid, studyId, demographicId, queryId, optionId, allText, createdAt, updatedAt, lang_code, apiUniqueId) values ? ON 
    DUPLICATE KEY UPDATE demographicId=values(demographicId), queryId=values(queryId),  optionId=values(optionId), allText=values(allText), updatedAt=(updatedAt),lang_code=values(lang_code)`;
    const result = await executeDev7(query, [data]);
    return result;
  } catch (error) {
    return (`Oops Something went wrong: ${error.message}`);
  }
}

async function upsertDemoAgeIntoDb(data) {
  try {
    const queryDemo = `insert into demoagemapping(sqid, studyId, demographicId, queryId, ageTo, ageFrom, createdAt, updatedAt, lang_code, apiUniqueId) values ? ON 
    DUPLICATE KEY UPDATE demographicId=values(demographicId), queryId=values(queryId), ageTo=values(ageTo), ageFrom=values(ageFrom), updatedAt=(updatedAt),lang_code=values(lang_code)`;
    const resultDemo =  await executeDev7(queryDemo, [data]);
    return resultDemo;
  } catch (error) {
    return (`Oops Something went wrong: ${error.message}`);
  }
}

async function upsertStudyDemoOrder(data) {
  try {
    const queryDemo = `insert into projectscreenerorder(studyId, screener_id, order_no, createdAt, updatedAt, lang_code, apiUniqueId) values ? ON 
    DUPLICATE KEY UPDATE studyId=values(studyId), screener_id=values(screener_id), order_no=values(order_no), updatedAt=(updatedAt),lang_code=values(lang_code)`;
    const resultDemo = await executeDev7(queryDemo, [data]);
    return resultDemo;
  } catch (error) {
    return (`Oops Something went wrong: ${error.message}`);
  }
}

async function insertQuotaDemoIntoDb(QuotaDemo) {
  try {
    const query = `INSERT INTO constrainstdemos(studyId, quotaId, demographicId, quotaDemoId, optionIds, createdAt, updatedAt) VALUES ?  ON DUPLICATE KEY UPDATE quotaId = VALUES(quotaId),demographicId = VALUES(demographicId),  optionIds = VALUES(optionIds), updatedAt = VALUES(updatedAt), isActive = VALUES(isActive)`;

    const result = await executeDev7(query, [QuotaDemo]);
    return result;
  } catch (error) {
    return (`Oops Something went wrong: ${error.message}`);
  }
}

async function getAllInsertedQuotas(surveyId) {
  try {
    const studyIds = surveyId.map(d => "UMT"+d).join("','");
    // const surveyIds = surveyId.join("','");//surveyId.map(d => `'${d}'`).join(','); //"'" + surveyId.join("','") + "'";   
    const getAllQuotaQuery = `select id, clientQuotaId, studyId, isActive from constrainsts where isActive = 1 and studyId in ('${studyIds}')`;
    const quotaData = await executeDev7(getAllQuotaQuery,[]);
    return quotaData;
    
  } catch (error) {
    return ("Oops Something wrong went during quota fetching!");
  }
}

async function upsertStudiesData(surveysData) {  
  try {
    const query = `INSERT INTO studies ( _id, studyName, description, orignalRequirment, firstPartyUrl, firstPartyUrlTest, fees, status, loi, ir, isActive,  apiType, country, apiClientId, apiSurveyId,surveyEndDate,device, isCountryCheck, EPC, isgroupsecurityactive, clientSurveyGUID, allowDemo, isPIIActive, lang_code,studytypes,isRouterEligible,lucidClientName,clientType) VALUES ? ON DUPLICATE KEY UPDATE firstPartyUrl = VALUES(firstPartyUrl), fees = VALUES(fees), loi = VALUES(loi),ir = VALUES(ir), updatedAt = VALUES(updatedAt), status = VALUES(status), isActive = VALUES(isActive), device = VALUES(device), EPC = VALUES(EPC), clientSurveyGUID = VALUES(clientSurveyGUID), allowDemo = VALUES(allowDemo), isPIIActive = VALUES(isPIIActive), lang_code = VALUES(lang_code),isRouterEligible=VALUES(isRouterEligible),lucidClientName=VALUES(lucidClientName),clientType=VALUES(clientType)`;
    const result =  await executeDev7(query, [surveysData]);
    return result;
  }catch(error){
    return ("oops SOmething went wrong, please contact to support!")
  }
}

async function InsertQuotaDataIntoDb(quotaData) {
  try {
    const query = `insert into constrainsts(sqid, clientQuotaId, studyId, type, title, totalQuota, requirement, isActive, createdAt, updatedAt, lang_code, apiUniqueQuotaId) values ? ON 
      DUPLICATE KEY UPDATE  title=values(title), totalQuota=values(totalQuota), requirement=values(requirement), isActive = values(isActive), updatedAt=(updatedAt),lang_code=values(lang_code)`;
    const responseData = await executeDev7(query, [quotaData]);
    return responseData;
  } catch (error) {
    return (`Oops Something went wrong: ${error.message}`);
  }
}

async function pauseUnAvailableQuotas( pauseUnAvailableQuotas ){
  try{
    const clientQuotaIds = pauseUnAvailableQuotas.join("','");
    const query = `Update constrainsts set isActive = 0 where clientQuotaId in ('${clientQuotaIds}')`;
    const resultResponse = await executeDev7(query, []);
    return resultResponse;
  } catch(error){
    return (`Oops! something went wrong, ${error.message}`);

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
async function upsertIntoUnmappedqualification(unMatchedSurveysIds,unMatchQualification,langCode){
  try {
    let clientId = 24;
    // Prepare the data bundle
    const dataBundle = [];
    // Loop through unMatchedSurveysIds and create the data for insertion
    for (let i = 0; i < unMatchedSurveysIds.length; i++) {
      const surveyId = unMatchedSurveysIds[i];
      const qualifications = unMatchQualification[i];
      // Convert qualifications array to comma-separated string
      const qualificationsString = qualifications.join(',');
      // Push data into the bundle
      dataBundle.push([`UMT${surveyId}`, clientId, qualificationsString, langCode, new Date()]);
    }
    const query = `insert into unmapped_api_quals(sid, cid,qualification_id,lang_code,created_at) values ? ON 
      DUPLICATE KEY UPDATE  qualification_id=values(qualification_id),lang_code=values(lang_code),created_at=values(created_at) `;
    const resultResponse = await executeDev7(query, [dataBundle]);
    return resultResponse;
  }
catch(error){
  return (`Oops! something went wrong, ${error.message}`);
}
}

async function updateAllSurveyStatus(allSurveys, apiClientId) {
  try {
    if (!allSurveys || allSurveys.length === 0) return [];

    const sql = `
      UPDATE studies 
      SET status = 'On Hold', isActive = 0 
      WHERE apiSurveyId IN (?) 
      AND apiClientId = ? 
      AND isActive = 1
    `;

    const result = await executeDev7(sql, [allSurveys, apiClientId]);
    return result;
  } catch (error) {
    console.error("Error updating survey status:", error);
    return [];
  }
}


module.exports = { getAllOptionsFromDb,
  getAllQualificationFromDb,
  existingMappings,
  upsertStudyDemoDb,
  upsertDemoAgeIntoDb,
  upsertStudyDemoOrder,
  insertQuotaDemoIntoDb,
  getAllInsertedQuotas,
  upsertStudiesData,
  InsertQuotaDataIntoDb,
  pauseUnAvailableQuotas,
  upsertIntoUnmappedqualification,
  upsertStudyisRouterEligible,
  updateAllSurveyStatus
 };