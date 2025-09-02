const { executeDev7 } = require('../../../database/queryWrapperMysql');
const { API_CLIENT_ID } = require('../utils/config');
const redis = require('../../../middlewares/redisClient');
const meta = require('../../../config/meta.json');
const { map: _map, slice : _slice , filter : _filter } = require('lodash');
const {createmapingBundle}  = require('../operation');
// const { syncOnVendorApis } = require('../../syncProjectsOnVendors/services');


/**
 * Retrieves the language ID from the database based on the language code.
 * @param {string} lang_code - The language code.
 * @returns {Promise<{ success: boolean, Ipsos: string }>} A promise that resolves to an object containing the language ID.
 * @throws {Error} If no language is found for the given language code or an error occurs during the fetching process.
 */

async function getLangIdFromDb(lang_code) {
    try {
      const query = `SELECT IpsosLangId FROM language WHERE lang_code = ?`;
      const result = await executeDev7(query, [lang_code]);
      
      if (result.length) {
        return { success: true, Ipsos: result[0].IpsosLangId}; 
      } else {
        throw new Error(`Oops no language found for lang_code '${lang_code}'`);
      }
    } catch (error) {
      throw new Error(`Oops Something went wrong during fetching language: ${error.message}`);
    }
  }
 
  async function insertlogs(data,status,surveyid,clientId) {
  try {
    const query = `insert into mcqApiLog(response,status,survey_id,client_Id) values (?,?,?,?)`
    const result = await executeDev7(query, [JSON.stringify(data),status,surveyid,clientId]);
    return result;
  } catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
  }
}

  /**
  * Retrieves all live surveys from the database based on the language code and Api Client Id.
  * @param {string} lang_code - The language code.
  * @returns {Promise<{ success: boolean, result: Array }>} A promise that resolves to an object containing the studies data.
  * @throws {Error} If an error occurs during the retrieval process.
  */
 async function getAllIpsosLiveSurveyFromDb( lang_code ){
     try {
        const query = "select apiSurveyId from studies where country = ? AND apiClientId = ? AND isActive = 1 and status = ? ";
        const allStudies = await executeDev7(query, [ lang_code , API_CLIENT_ID, 'Live']);
        
        if(allStudies.length){
          return _map(allStudies, 'apiSurveyId');
        }else{
          return []
        }
    
      } catch( error ) {
        throw new Error("Oops Something went wrong during fetching live studies! ")
      }
  }

/**
 * Upserts survey data into the database.
 * @param {Array} surveysData - The survey data to be upserted.
 */

async function upsertIpsosStudiesData(surveysData){
  try {
      const query = "INSERT INTO studies ( _id, studyName, description, orignalRequirment, firstPartyUrl, firstPartyUrlTest, fees, status, loi, ir, isActive,  apiType, country, lang_code, apiClientId, client, apiSurveyId,surveyEndDate, device, isCountryCheck, isgroupsecurityactive, allowDemo, isPIIActive, studytypes, isSampleChainReview, vendorSharedQuota, clientType, categoryId,isRouterEligible,lucidClientName) VALUES ? ON DUPLICATE KEY UPDATE orignalRequirment = VALUES(orignalRequirment), firstPartyUrl = VALUES(firstPartyUrl), fees = VALUES(fees), loi = VALUES(loi),ir = VALUES(ir), updatedAt = VALUES(updatedAt), status = VALUES(status), isActive = VALUES(isActive), device = VALUES(device), EPC = VALUES(EPC), studytypes = VALUES(studytypes),isRouterEligible=VALUES(isRouterEligible),lucidClientName=values(lucidClientName)";
      const result = await executeDev7(query, [surveysData]);
      return result;
  } catch (error) {
      throw new Error("Oops something went wrong during upserting survey data!");
  }
}

  /**
 * update all live surveys from the database based on the Api Client Id.
 * @param {string} lang_code - The language code.
 * @returns {Promise<{ success: boolean, result: Array }>} A promise that resolves to an object containing the studies data.
 * @throws {Error} If an error occurs during the retrieval process.
 */
  async function updateAllSurveyStatus(allSurveysIds) {
    try{
        const quotedIds = allSurveysIds.map(id => `'IPSOS${id}'`);
        const allApiSurveyIds = quotedIds.join(',');
        const query = `UPDATE studies SET status = 'On Hold', isActive = 0 where _id IN (${allApiSurveyIds}) AND apiClientId = ?`;
        const result = await executeDev7(query, [API_CLIENT_ID]);
        return result;
  
      }catch( error ){
          throw new Error("Oops Something went wrong during updation study! ");
      }
  }

/**
 * Retrieves all qualifications from the database.
 * @param {string} lang_code - The language code.
 * @returns {Promise<Object>} - The qualification data.
 * @throws {Error} - If an error occurs while retrieving the data.
 */
async function getAllQualificationFromDb(lang_code) {
  try {
    const query = `select d.*,demo._id as demo_id from demoquery as d left join demographics as demo on demo._id = d.demographicId where d.lang_code = ? and d.ipsosQid is not null`;
    const ALL_CACHED_QUALIFICATION = { key: 'getAllIpsosQual_Data', expiry: meta.noExpire };
    const result = await redis.getData(ALL_CACHED_QUALIFICATION, query, [lang_code], { lang_code });
    return result;
  } catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
  }
}

/**
 * Retrieves all options from the database.
 * @param {string} lang_code - The language code.
 * @returns {Promise<Object>} - The options data.
 * @throws {Error} - If an error occurs while retrieving the data.
 */
async function getAllOptionsFromDb(lang_code) {
  try {
    const query = 'select * from queryoptions where lang_code = ? and ipsosOid is not null';
    const ALL_CACHED_QUALIFICATION = { key: 'getAllIPSOSOption', expiry: meta.noExpire };
    const result = await redis.getData(ALL_CACHED_QUALIFICATION, query, [lang_code], { lang_code });
    return result;
  } catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
  }
}

/**
 * Upserts study demographic data into the database.
 * @param {Array} data - The data to be upserted.
 * @returns {Promise} - The result of the upsert operation.
 * @throws {Error} - If an error occurs during the upsert operation.
 */
async function upsertStudyDemoDb(data) {
  try {
    const query = `insert into studydemomapping(sqid, studyId, demographicId, queryId, optionId, allText, createdAt, updatedAt, lang_code, apiUniqueId) values ? ON 
    DUPLICATE KEY UPDATE demographicId=values(demographicId), queryId=values(queryId),  optionId=values(optionId), allText=values(allText), updatedAt=(updatedAt),lang_code=values(lang_code)`;
    const result = await executeDev7(query, [data]);
    return result;
  } catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
  }
}

/**
 * Upserts demographic age data into the database.
 * @param {Array} data - The data to be upserted.
 * @returns {Promise} - The result of the upsert operation.
 * @throws {Error} - If an error occurs during the upsert operation.
 */
async function upsertDemoAgeIntoDb(data) {
  try {
    const queryDemo = `insert into demoagemapping(sqid, studyId, demographicId, queryId, ageTo, ageFrom, createdAt, updatedAt, lang_code, apiUniqueId) values ? ON 
    DUPLICATE KEY UPDATE demographicId=values(demographicId), queryId=values(queryId), ageTo=values(ageTo), ageFrom=values(ageFrom), updatedAt=(updatedAt),lang_code=values(lang_code)`;
    const resultDemo = await executeDev7(queryDemo, [data]);
    return resultDemo;
  } catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
  }
}

async function upsertStudyDemoOrder(data) {
  try {
    const queryDemo = `insert into projectscreenerorder(studyId, screener_id, order_no, createdAt, updatedAt, lang_code, apiUniqueId) values ? ON 
    DUPLICATE KEY UPDATE studyId=values(studyId), screener_id=values(screener_id), order_no=values(order_no), updatedAt=(updatedAt),lang_code=values(lang_code)`;
    const resultDemo = await executeDev7(queryDemo, [data]);
    return resultDemo;
  } catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
  }
}

async function upsertStudyisRouterEligible(studyIds){
  try{
    const query = `update studies set isRouterEligible = 1 where _id in ('${studyIds}') `;
    const response = await executeDev7(query,[]);
    return response;
  }catch(error){
    return [];
  }
}


/**
 * Inserts quota data into the database.
 * @param {Array} quotaData - The quota data to be inserted.
 * @returns {Promise} - The result of the insert operation.
 * @throws {Error} - If an error occurs during the insert operation.
 */
async function InsertQuotaDataIntoDb(quotaData) {
  try {
    const query = `insert into constrainsts(sqid, clientQuotaId, studyId, type, title, totalQuota, requirement, isActive, createdAt, updatedAt, lang_code, apiUniqueQuotaId) values ? ON 
      DUPLICATE KEY UPDATE  title=values(title), totalQuota=values(totalQuota), requirement=values(requirement), isActive = values(isActive), updatedAt=(updatedAt),lang_code=values(lang_code)`;
    const responseData = await executeDev7(query, [quotaData]);
    return responseData;
  } catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
  }
}


/**
 * Retrieves all inserted quotas for a survey.
 * @param {string} surveyId - The survey ID.
 * @returns {Promise<Array>} - The quota data.
 * @throws {Error} - If an error occurs while retrieving the data.
 */
async function getAllInsertedQuotas(surveyIds) {
  try {
    const studyIds = surveyIds.map(d => "IPSOS"+d).join("','");
    const getAllQuotaQuery = `select id, clientQuotaId, studyId, isActive from constrainsts where studyId in ('${studyIds}')`;
    const quotaData = await executeDev7(getAllQuotaQuery,[]);
    return quotaData;
    
  } catch (error) {
    throw new Error("Oops Something wrong went during quota fetching!");
  }
}

async function updateCompleteRequired( totalCompletes, surveyId ) {
  try {
    const updateQuery = `update studies set orignalRequirment = ? where apiSurveyId = ?`;
    const result = await executeDev7(updateQuery,[ totalCompletes, surveyId ]);
    return result;
    
  } catch (error) {
    throw new Error("Oops Something wrong went during quota fetching!");
  }
}

async function pauseStudiesIpsos(surveyId ) {
  try {
    const updateQuery = `update studies set status = 'On Hold' where apiSurveyId = ?`;
    const result = await executeDev7(updateQuery,[ surveyId ]);
    return result;
    
  } catch (error) {
    throw new Error("Oops Something wrong went during quota fetching!");
  }
}
/**
 * Inserts quota demographic data into the database.
 * @param {Array} QuotaDemo - The quota demographic data to be inserted.
 * @returns {Promise} - The result of the insert operation.
 * @throws {Error} - If an error occurs during the insert operation.
 */
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

async function pauseUnAvailableQuotas( pauseUnAvailableQuotas ){
  try{
    const clientQuotaIds = pauseUnAvailableQuotas.join("','");
    const query = `Update constrainsts set isActive = 0 where clientQuotaId in ('${clientQuotaIds}')`;
    const resultResponse = await executeDev7(query, []);
    return resultResponse;
  }catch(error){
    throw new Error(`Oops! something went wrong, ${error.message}`);

  }
}
async function upsertIntoUnmappedqualification(unMappedSurveyIds, unMappedQuals, lang_Codes) {
  try {
    const clientId = 17;
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

    // Prepare data bundle with joined qualifications and langCodes
    for (const surveyId in surveyMap) {
      const qualifications = surveyMap[surveyId].qualifications.join(',');
      const langCodes = surveyMap[surveyId].langCodes[0];
      dataBundle.push([`${surveyId}`, clientId, qualifications, langCodes, new Date()]);
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

async function vendorMapping(surveyData) {
  let vendorId = ["7202011VENDOR1607321927050","2420212VENDOR1616592262014","2420201VENDOR1582554920786","7202011VENDOR1607322159095"];
  let vendorData = await getVendorData(vendorId);

  for (let i = 0; i < surveyData.length; i++) {
    let requirement = await getCompleteRequired(surveyData[i][0]);
    for (let j = 0; j < vendorId.length; j++) {
      const checkMappingForStudies = await getMappingOfStudy(vendorId[j], surveyData[i][0]);
      if (checkMappingForStudies.length) continue;
      let currentVendorData = vendorData.data.filter(item => item._id == vendorId[j]);
      currentVendorData[0].vendorCpi = surveyData[i][6] * (1 - 0.25);
      let mappingData = await createmapingBundle(surveyData[i], currentVendorData, requirement[0].orignalRequirment);
      await upsertMappingData(mappingData);
    }
    // await syncOnVendorApis(surveyData[i][0]);
  }
}

async function getVendorData(id) {
  try {
    Array.isArray(id) ? id : id = [id];
    const vendorIds = "'" + id.join("','") + "'" ;
    const query = `Select * from vendors  where _id in (${vendorIds})`;
    const result = await executeDev7(query, []);

    if (result.length) {
      return { success: true, data: result };
    } else {
      return { success: false };
    }
  } catch (error) {
    return { success: false };
  }
}

async function getMappingOfStudy(TID, SID) {
  try {
    const query = `SELECT * FROM mappings WHERE studyId = ? and thirdPartyId = ?`;
    const response = await executeDev7(query, [SID, TID]);
    return response;
  } catch (error) {
    throw new Error('Oops! Something went wrong. Please contact support!', error);
  }
}


async function upsertMappingData(data) {
  try {
    var column = '_id, sidTid, studyId, thirdPartyId, successUrl, terminateUrl, overQuotaUrl, securityTerminate, studyUrl, studyTestUrl, createdAt, updatedAt, requirement, totalQuota, vendorCpi, po, projectCpi, isClientActive, isQuotaEnabled, max_cpi, max_cpi_inflated,flatCpi';
    let query = `INSERT INTO mappings (${column}) VALUES ? ON DUPLICATE KEY UPDATE   updatedAt = VALUES(updatedAt), vendorCpi = VALUES(vendorCpi), projectCpi = VALUES(projectCpi), studyUrl = VALUES(studyUrl)`;
    const result = await executeDev7(query, [data]);

    if (Object.keys(result).length) {
      return { success: true, data: result };
    } else {

      throw new Error(`Oops Something went wrong during fetching data`);
    }
  } catch (error) {

    throw new Error(`Oops Something went wrong during fetching data`);
  }
}

async function getCompleteRequired( surveyId ) {
  try {
    const updateQuery = `Select orignalRequirment from studies where _id = ?`;
    const result = await executeDev7(updateQuery,[ surveyId ]);
    return result;
    
  } catch (error) {
    throw new Error("Oops Something wrong went during quota fetching!");
  }
}

module.exports = {insertlogs , getCompleteRequired, vendorMapping, pauseStudiesIpsos,getLangIdFromDb,getAllIpsosLiveSurveyFromDb,upsertIpsosStudiesData,updateAllSurveyStatus,getAllQualificationFromDb,getAllOptionsFromDb,upsertStudyDemoDb,upsertDemoAgeIntoDb,upsertStudyDemoOrder,upsertStudyisRouterEligible,InsertQuotaDataIntoDb,getAllInsertedQuotas, updateCompleteRequired,insertQuotaDemoIntoDb,pauseUnAvailableQuotas,upsertIntoUnmappedqualification, upsertMappingData };

