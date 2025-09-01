const {queryWrapper} = require('../../database/databaseSetupMysql');
const { executeDev7 } = require('../../database/queryWrapperMysql');
const redis = require('../../middlewares/redisClient');
const meta = require('../../config/meta.json');
const appConstants = require('./appConstants');
const { map: _map, slice : _slice , filter : _filter } = require('lodash');

async function deletePulledStudies(_id) {
  const sql = "DELETE FROM pulled_studies WHERE _id = ?";

  const result = await executeDev7(sql, [_id]);

  // return a consistent response object
  return {
    success: true,
    message: "Study deleted successfully",
    result: result
  };
}

async function getAllQualificationFromDb(lang_code) {
  try {
    const query = `select mcqQid, lang_code, demographicId, _id from demoquery where  mcqQid is not null and lang_code = '${lang_code}'`;
    const ALL_CACHED_QUALIFICATION = { key: `getAllMCQSQualification_${lang_code}`, expiry: meta.noExpire };
    const result = await redis.getData(ALL_CACHED_QUALIFICATION, query, [], {});
    return result;
  } catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
  }
}


async function getAllOptionsFromDb(lang_code) {
  try {
    const query = `select lang_code, mcqOpId, demographicId, queryId, _id from queryoptions where mcqOpId is not null and lang_code = '${lang_code}'`;
    const ALL_CACHED_QUALIFICATION = { key: `getAllMCQSOption_cach_${lang_code}`, expiry: meta.noExpire };
    const result = await redis.getData(ALL_CACHED_QUALIFICATION, query, [], {});
    return result;
  } catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
  }
}


async function getAllLangCodeForMcq() {
  try {
    const query = 'select lang_code, marketCubeId from language where marketCubeId is not null';
    const ALL_CACHED_QUALIFICATION = { key: 'getAllLanguageMCQFromDBs', expiry: meta.noExpire };
    const result = await redis.getData(ALL_CACHED_QUALIFICATION, query, [], {});
    return result;
  } catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
  }
}


async function upsertStudyDemoDb(data) {
  try {
    const sql = `INSERT INTO studydemomapping
      (sqid, studyId, demographicId, queryId, optionId, allText, createdAt, updatedAt, lang_code, apiUniqueId)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        demographicId = VALUES(demographicId),
        queryId = VALUES(queryId),
        optionId = VALUES(optionId),
        allText = VALUES(allText),
        updatedAt = NOW(),
        lang_code = VALUES(lang_code)`;

    // executeDev7 expects query and values array
    const result = await executeDev7(sql, [data]);
    return result;
  } catch (err) {
    console.error("Error in upsertStudyDemoDb:", err);
    return [];
  }
}


async function insertlogs(data, status, surveyid) {
  try {
    const sql = "INSERT INTO mcqApiLog(response, status, survey_id, created_at) VALUES (?, ?, ?, ?)";
    
    const result = await executeDev7(sql, [JSON.stringify(data), status, surveyid,new Date]);
    
    return result;
  } catch (error) {
    console.error("Error inserting logs:", error);
    return [];
  }
}


async function upsertDemoAgeIntoDb(surveydata) {
  try {
    const sql = `INSERT INTO demoagemapping
      (sqid, studyId, demographicId, queryId, ageTo, ageFrom, createdAt, updatedAt, lang_code, apiUniqueId)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        demographicId = VALUES(demographicId),
        queryId = VALUES(queryId),
        ageTo = VALUES(ageTo),
        ageFrom = VALUES(ageFrom),
        updatedAt = NOW(),
        lang_code = VALUES(lang_code)`;

    const result = await executeDev7(sql, [surveydata]);
    return result;
  } catch (error) {
    console.error("Error in upsertDemoAgeIntoDb:", error);
    return [];
  }
}


async function upsertStudyDemoOrder(surveyData) {
  try {
    const sql = `INSERT INTO projectscreenerorder
      (studyId, screener_id, order_no, createdAt, updatedAt, lang_code, apiUniqueId)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        studyId = VALUES(studyId),
        screener_id = VALUES(screener_id),
        order_no = VALUES(order_no),
        updatedAt = NOW(),
        lang_code = VALUES(lang_code)`;

    const result = await executeDev7(sql, [surveyData]);
    return result;
  } catch (error) {
    console.error("Error in upsertStudyDemoOrder:", error);
    return [];
  }
}


async function InsertQuotaDataIntoDb(quotaData) {
  try {
    const sql = `INSERT INTO constrainsts
      (sqid, clientQuotaId, studyId, type, title, totalQuota, requirement, isActive, createdAt, updatedAt, lang_code, apiUniqueQuotaId)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        totalQuota = VALUES(totalQuota),
        requirement = VALUES(requirement),
        isActive = VALUES(isActive),
        updatedAt = NOW(),
        lang_code = VALUES(lang_code)`;

    const result = await executeDev7(sql, [quotaData]);
    return result;
  } catch (error) {
    console.error("Error in InsertQuotaDataIntoDb:", error);
    return [];
  }
}



async function getAllInsertedQuotas(surveyIds) {
  try {
    if (!surveyIds || surveyIds.length === 0) return [];

    // Prefix survey IDs with "MCQ"
    const prefixedIds = surveyIds.map(d => "MCQ" + d);

    // Prepare placeholders for parameterized query
    const placeholders = prefixedIds.map(() => "?").join(",");

    const sql = `SELECT id, clientQuotaId, studyId, isActive 
                 FROM constrainsts 
                 WHERE studyId IN (${placeholders})`;

    const result = await executeDev7(sql, prefixedIds);
    return result;
  } catch (error) {
    console.error("Error fetching quotas:", error);
    return [];
  }
}



async function insertQuotaDemoIntoDb(QuotaDemo) {
  try {
    const sql = `INSERT INTO constrainstdemos
      (studyId, quotaId, demographicId, quotaDemoId, optionIds, createdAt, updatedAt)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        quotaId = VALUES(quotaId),
        demographicId = VALUES(demographicId),
        optionIds = VALUES(optionIds),
        updatedAt = NOW()`;

    const result = await executeDev7(sql, [QuotaDemo]);
    return result;
  } catch (error) {
    console.error("Error inserting quota demo data:", error);
    return [];
  }
}



async function pauseUnAvailableQuotas(pauseUnAvailableQuotas) {
  try {
    if (!pauseUnAvailableQuotas || pauseUnAvailableQuotas.length === 0) return [];

    // Prepare placeholders for parameterized query
    const placeholders = pauseUnAvailableQuotas.map(() => "?").join(",");

    const sql = `UPDATE constrainsts 
                 SET isActive = 0 
                 WHERE clientQuotaId IN (${placeholders})`;

    const result = await executeDev7(sql, pauseUnAvailableQuotas);
    return result;
  } catch (error) {
    console.error(`Error pausing unavailable quotas: ${error.message}`);
    return [];
  }
}


async function updateGroupSurveysData(allStudyIds, surveyGroupId, apiClientId = 1) {
  try {
    if (!allStudyIds || allStudyIds.length === 0) return [];

    // Prepare placeholders for _id
    const placeholders = allStudyIds.map(() => "?").join(",");

    // groupsecurity value as string
    const groupValue = surveyGroupId.includes(",") ? `"${surveyGroupId}"` : surveyGroupId;

    const sql = `UPDATE studies 
                 SET groupsecurity = ${groupValue} 
                 WHERE apiClientId = ? 
                 AND _id IN (${placeholders}) 
                 AND isActive = 1`;

    // Parameters: apiClientId followed by allStudyIds
    const params = [apiClientId, ...allStudyIds];

    const result = await executeDev7(sql, params);
    return result;
  } catch (error) {
    console.error("Error updating group surveys data:", error);
    return [];
  }
}



async function upsertStudyisRouterEligible(studyIds) {
  try {
    if (!studyIds || studyIds.length === 0) return [];

    // Prepare placeholders for parameterized query
    const placeholders = studyIds.map(() => "?").join(",");

    const sql = `UPDATE studies 
                 SET isRouterEligible = 1 
                 WHERE _id IN (${placeholders})`;

    const result = await executeDev7(sql, studyIds);
    return result;
  } catch (error) {
    console.error("Error updating isRouterEligible:", error);
    return [];
  }
}
async function upsertIntoUnmappedqualification(unMappedSurveyIds, unMappedQuals, lang_Codes) {
  try {
    if (!unMappedSurveyIds || unMappedSurveyIds.length === 0) return [];

    const clientId = 1;
    const dataBundle = [];
    const surveyMap = {};

    // Group qualifications and langCodes by surveyId
    for (let i = 0; i < unMappedSurveyIds.length; i++) {
      const surveyId = unMappedSurveyIds[i];
      const qualification = unMappedQuals[i];
      const langCode = lang_Codes[i];

      if (!surveyMap[surveyId]) {
        surveyMap[surveyId] = { qualifications: [], langCodes: [] };
      }
      surveyMap[surveyId].qualifications.push(qualification);
      surveyMap[surveyId].langCodes.push(langCode);
    }

    // Prepare data bundle with joined qualifications and first langCode
    for (const surveyId in surveyMap) {
      const qualifications = surveyMap[surveyId].qualifications.join(',');
      const langCode = surveyMap[surveyId].langCodes[0];
      dataBundle.push([`${surveyId}`, clientId, qualifications, langCode, new Date()]);
    }

    // Upsert using executeDev7
    const sql = `
      INSERT INTO unmapped_api_quals (sid, cid, qualification_id, lang_code, created_at)
      VALUES ? 
      ON DUPLICATE KEY UPDATE 
        qualification_id = VALUES(qualification_id),
        lang_code = VALUES(lang_code),
        created_at = VALUES(created_at)
    `;

    const result = await executeDev7(sql, [dataBundle]);
    return result;

  } catch (error) {
    console.error("Error in upsertIntoUnmappedqualification:", error);
    return [];
  }
}


async function upsertIntoStudies(surveyData) {
  try {
    if (!surveyData || surveyData.length === 0) return [];

    const sql = `
      INSERT INTO studies 
      (_id, studyName, description, orignalRequirment, firstPartyUrl, firstPartyUrlTest, fees, status, loi, ir, isActive, apiType, country, apiClientId, apiSurveyId, surveyEndDate, device, isCountryCheck, EPC, isgroupsecurityactive, clientSurveyGUID, allowDemo, device_v2, isPIIActive, lucidClientName, lang_code, studytypes, isRouterEligible, clientType)
      VALUES ? 
      ON DUPLICATE KEY UPDATE
        orignalRequirment = VALUES(orignalRequirment),
        firstPartyUrl = VALUES(firstPartyUrl),
        fees = VALUES(fees),
        loi = VALUES(loi),
        ir = VALUES(ir),
        updatedAt = NOW(),
        status = VALUES(status),
        isActive = VALUES(isActive),
        device = VALUES(device),
        EPC = VALUES(EPC),
        isgroupsecurityactive = VALUES(isgroupsecurityactive),
        clientSurveyGUID = VALUES(clientSurveyGUID),
        allowDemo = VALUES(allowDemo),
        device_v2 = VALUES(device_v2),
        isPIIActive = VALUES(isPIIActive),
        lucidClientName = VALUES(lucidClientName),
        lang_code = VALUES(lang_code),
        isRouterEligible = VALUES(isRouterEligible),
        clientType = VALUES(clientType)
    `;

    const result = await executeDev7(sql, [surveyData]);
    return result;
  } catch (error) {
    console.error("Error upserting studies:", error);
    return [];
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


async function insertRecord(dataQuery, record) {
  try {
    const result = await executeDev7(dataQuery, [record]);

    const data = {};
    if (!result || result.errno) {
      data.result = false;
      return [data];
    }

    if (Array.isArray(result) && result.length > 0) {
      data.result = true;
      data.studyData = result;
    } else {
      data.result = false;
    }

    return [data];
  } catch (error) {
    console.error("Error in insertRecord:", error);
    return [{ result: false }];
  }
}



  async function getAllApiSurveyFromDbStudies(country, apiClientType) {
    // Do async job
    var query = "";
    var paramsData;
    let allSurveys; //[]
    if (apiClientType === appConstants.MCQ_SURVEY_TYPE_ID) {
        query = "select apiSurveyId from studies where apiClientId = ? AND isActive = 1";
        paramsData = [apiClientType]
        allSurveys = await getAllSurveyFromDbStudies(appConstants.SURVEYS_FROM_STUDIES, query, { apiClientType }, {apiClientType});
    } else {
        query = "select apiSurveyId from studies where country = ? AND apiClientId = ? AND isActive = 1";
        paramsData = [country, apiClientType]
        allSurveys = await getAllSurveyFromDbStudies(appConstants.SURVEYS_FROM_STUDIES, query, { country, apiClientType },  {country, apiClientType});
    }
    console.log("allSurveys", allSurveys);
    return allSurveys;
}

async function getAllSurveyFromDbStudies(key, query, queryParam, cacheKeyParam) {
    try {
        redis.removeOne('surveysFromStudies~apiClientType_1')
        const result = await redis.getData(key, query, queryParam, cacheKeyParam);
        //Apply business logic or filter data as per conditions supplied in queryParam
        return _map(result, 'apiSurveyId');
    } catch (error) {
        return error;
    }
}

module.exports = {insertRecord, getAllApiSurveyFromDbStudies, updateAllSurveyStatus, upsertIntoStudies, insertlogs, deletePulledStudies, getAllInsertedQuotas, upsertDemoAgeIntoDb, upsertStudyDemoOrder, InsertQuotaDataIntoDb, getAllQualificationFromDb, getAllOptionsFromDb, getAllLangCodeForMcq, upsertStudyDemoDb, updateGroupSurveysData, upsertStudyisRouterEligible, pauseUnAvailableQuotas, insertQuotaDemoIntoDb,upsertIntoUnmappedqualification }