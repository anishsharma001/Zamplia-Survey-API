const { executeDev7 } = require('../../database/queryWrapperMysql');
const meta = require('../../config/meta.json');
const redis = require('../../middlewares/redisClient');
const { map: _map, slice: _slice, filter: _filter, throttle } = require('lodash');

async function getLangIdFromDb(lang_code) {
  try {
    const query = 'SELECT biobrainlangId FROM language WHERE lang_code = ?';
    const result = await executeDev7(query, [lang_code]);

    if (result.length) {

      return { success: true, marketCubeId: result[0].biobrainlangId  };
    } else {

      throw new Error(`Oops no language found for lang_code '${lang_code}'`);
    }
  } catch (error) {

    throw new Error(`Oops Something went wrong during fetching language: ${error.message}`);
  }
}

async function getAppConfig(config) {
  try {
    const query = `Select * from app_configs where configType = '${config}' limit 1;`;
    const result = await executeDev7(query, [config]);

    if (result.length) {
      return result;
    } else {
      throw new Error(`Oops no app config found for configType '${config}'`);
    }
  } catch (error) {
    throw new Error(`Oops Something went wrong during fetching app config: ${error.message}`);
  }
}


async function upsertStudiesData(surveysData) {
  try {
    const query = "INSERT INTO studies ( _id, studyName, description, orignalRequirment, firstPartyUrl, firstPartyUrlTest, fees, status, loi, ir, isActive,  apiType, country, lang_code, apiClientId, client, apiSurveyId,surveyEndDate, device, isCountryCheck, isgroupsecurityactive, allowDemo, isPIIActive, studytypes, isSampleChainReview, vendorSharedQuota, clientType, categoryId,lucidClientName,isRouterEligible) VALUES ? ON DUPLICATE KEY UPDATE orignalRequirment = VALUES(orignalRequirment), firstPartyUrl = VALUES(firstPartyUrl), fees = VALUES(fees), loi = VALUES(loi),ir = VALUES(ir), updatedAt = VALUES(updatedAt), status = VALUES(status), isActive = VALUES(isActive), device = VALUES(device), EPC = VALUES(EPC), clientSurveyGUID = VALUES(clientSurveyGUID),isgroupsecurityactive = VALUES(isgroupsecurityactive), allowDemo = VALUES(allowDemo), isPIIActive = VALUES(isPIIActive), studytypes = VALUES(studytypes), categoryId = VALUES(categoryId), lucidClientName = VALUES(lucidClientName),isRouterEligible=VALUES(isRouterEligible)";
    const result = await executeDev7(query, [surveysData]);
    return result;
  } catch (error) {
    throw new Error("oops SOmething went wrong, please contact to support!")
  }
}

async function getAllQualificationFromDb(lang_code) {
  try {
    const query = 'select * from demoquery where lang_code = ? and mcqQid  is not null';
    const ALL_CACHED_QUALIFICATION = { key: 'getAllBrainBrioQuals', expiry: meta.noExpire };
    const result = await redis.getData(ALL_CACHED_QUALIFICATION, query, [lang_code], { lang_code });
    return result;
  } catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
  }
}

async function getAllOptionsFromDb(lang_code) {
  try {
    const query = 'select * from queryoptions where lang_code = ? and marketCubeOid is not null';
    const ALL_CACHED_QUALIFICATION = { key: 'getAllBrainBrioAns', expiry: meta.noExpire };
    const result = await redis.getData(ALL_CACHED_QUALIFICATION, query, [lang_code], { lang_code });
    return result;
  } catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
  }
}

async function insertStudyDemoAgeMapping(maaping) {
  try {
    const query = "INSERT INTO demoagemapping (studyId, demographicId, queryId, ageFrom, ageTo, lang_code, createdAt, updatedAt,sqid,apiUniqueId) VALUES ? ON DUPLICATE KEY UPDATE demographicId = VALUES(demographicId), queryId = VALUES(queryId),  ageFrom = VALUES(ageFrom),  ageTo = VALUES(ageTo),  updatedAt = VALUES(updatedAt),  lang_code = VALUES(lang_code) ;";
    const result = await executeDev7(query, [maaping]);
    return result;
  } catch (error) {
    throw new Error("oops SOmething went wrong, please contact to support!")
  }

}
async function insertStudyDemoMapping(maaping) {
  try {
    const query = "INSERT INTO studydemomapping (studyId,demographicId,queryId,optionId,allText,lang_code,createdAt, updatedAt,sqid,apiUniqueId) VALUES ? ON DUPLICATE KEY UPDATE demographicId=values(demographicId), queryId=values(queryId),  optionId=values(optionId), allText=values(allText), updatedAt=values(updatedAt),lang_code=values(lang_code) ";
    const result = await executeDev7(query, [maaping]);
    return result;
  } catch (error) {
    throw new Error("oops SOmething went wrong, please contact to support!")
  }

}

async function upsertIntoUnmappedqualification(unMappedSurveyIds, unMappedQuals, lang_Code) {
  try {
    const clientId = 43;
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
      dataBundle.push([`BB${surveyId}`, clientId, qualifications, lang_Code, new Date()]);
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

async function updateRequirement(totalQuota, surveyId) {
  try {
    const query = `UPDATE studies set orignalRequirment = ? where apiSurveyId = ?`;
    const result = await executeDev7(query, [totalQuota, surveyId]);
    return result;
  } catch (error) {
    throw new Error("Oops Something went wrong");
  }

}

async function InsertQuotaDataIntoDb(quotaData) {
  try {
    const query = `insert into constrainsts(sqid, clientQuotaId, studyId, type, title, totalQuota, requirement, isActive, createdAt, updatedAt, lang_code, apiUniqueQuotaId) values ? ON
        DUPLICATE KEY UPDATE  title=values(title), totalQuota=values(totalQuota), requirement=values(requirement), isActive = values(isActive), updatedAt=values(updatedAt),lang_code=values(lang_code)`;
    const responseData = await executeDev7(query, [quotaData]);
    return responseData;
  } catch (error) {

    throw new Error(`Oops Something went wrong: ${error.message}`);
  
  }
}


async function getAllInsertedQuotas(surveyIds) {
  try {
    const studyIds = surveyIds.map((d) => "BB" + d).join("','");
    const query = `SELECT id, clientQuotaId, studyId, isActive from constrainsts where studyId IN ('${studyIds}')`;
    const result = await executeDev7(query, []);
    return result;
  } catch (error) {
    throw new Error("Oops Something Went Wrong");
  }
}

async function insertQuotaDemoIntoDb(QuotaDemo) {
  try {
   
    const query = `INSERT INTO constrainstdemos(studyId, quotaId, demographicId, quotaDemoId, optionIds, createdAt, updatedAt)
      VALUES ?  ON DUPLICATE KEY UPDATE   quotaId = VALUES(quotaId),   demographicId = VALUES(demographicId),  optionIds = VALUES(optionIds),  updatedAt = VALUES(updatedAt)`;

    const result = await executeDev7(query, [QuotaDemo]);
    return result;
 
  } catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
  }
}
async function pauseUnAvailableQuotas(pauseUnAvailableQuotas) {
  try {
    const clientQuotaIds = pauseUnAvailableQuotas.join("','");
  
    const query = `Update constrainsts set isActive = 0 where clientQuotaId in ('${clientQuotaIds}')`;
    const resultResponse = await executeDev7(query, []);
    return resultResponse;
  } catch (error) {
    throw new Error(`Oops! something went wrong, ${error.message}`);
  }
}


async function getAllLiveSurveyFromDb(lang_code) {
  try {
    const query = "select apiSurveyId from studies where country = ? AND apiClientId = ? AND isActive = 1 and status = ? ";
    const allStudies = await executeDev7(query, [lang_code, 43, 'Live']);

    if (allStudies.length) {
      return _map(allStudies, study => Number(study.apiSurveyId));
    } else {
      return []
    }

  } catch (error) {
    throw new Error("Oops Something went wrong during fetching live studies! ")
  }
}

async function pauseBioBrainSurveys(allSurveysIds, clientId) {
  try {
    const allApiSurveyIds = allSurveysIds.map(d => d).join("','")
    const query = `UPDATE studies SET status = 'On Hold', isActive = 0 where apiSurveyId IN('${allApiSurveyIds}') AND apiClientId = ${clientId}`;
  
    const result = await executeDev7(query, []);
    return result;

  } catch (error) {
    throw new Error("Oops Something went wrong during updation study! ");
  }
}


module.exports = {getAllLiveSurveyFromDb, pauseBioBrainSurveys, getLangIdFromDb, upsertStudiesData, getAllQualificationFromDb , getAllOptionsFromDb,insertStudyDemoAgeMapping, insertStudyDemoMapping, upsertIntoUnmappedqualification, upsertStudyisRouterEligible, updateRequirement, InsertQuotaDataIntoDb, getAllInsertedQuotas, insertQuotaDemoIntoDb, pauseUnAvailableQuotas , getAppConfig}