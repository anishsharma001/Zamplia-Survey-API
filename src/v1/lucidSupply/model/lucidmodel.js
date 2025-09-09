const { execute, executeDev7 } = require('../../../database/queryWrapperMysql');
const redis = require('../../../middlewares/redisClient');
const meta = require('../../../config/meta.json');
const {ApiClientId} = require('../utils/common');
const { map: _map, slice : _slice , filter : _filter } = require('lodash');

/**
 * Retrieves the language ID from the database based on the language code.
 * @param {string} lang_code - The language code.
 * @returns {Promise<{ success: boolean, lucidLangId: string }>} A promise that resolves to an object containing the language ID.
 * @throws {Error} If no language is found for the given language code or an error occurs during the fetching process.
 */
async function getLangIdFromDb(lang_code) {
  try {
    const query = 'SELECT lucidLangId FROM language WHERE lang_code = ?';
    const result = await execute(query, [lang_code]);
    
    if (result.length) {
      return { success: true, lucidLangId: result[0].lucidLangId };
    } else {
      throw new Error(`Oops no language found for lang_code '${lang_code}'`);
    }
  } catch (error) {
    throw new Error(`Oops Something went wrong during fetching language: ${error.message}`);
  }
}

async function getlucidBuyerListFromDb() {
  try {
    const query = 'SELECT buyername, priority FROM lucid_buyer_name_priority';
    const result = await execute(query, []);
    if (result.length) {
      return result ;
    } else {
      return [] 
    }
  } catch (error) {
    return [] 
  }
}

/**
 * Upserts survey data into the database.
 * @param {Array} surveysData - The survey data to be upserted.
 */
async function upsertStudiesData(surveysData) {
  let initialBatchSize = 200;
  let maxAttempts = 3;
  const query = `
    INSERT INTO studies (
      _id, studyName, description, orignalRequirment, firstPartyUrl, firstPartyUrlTest, 
      fees, status, loi, ir, isActive, apiType, country, lang_code, apiClientId, client, 
      apiSurveyId, surveyEndDate, device, isCountryCheck, isgroupsecurityactive, allowDemo, 
      isPIIActive, studytypes, isSampleChainReview, vendorSharedQuota, clientType, categoryId, 
      lucidClientName, lucidClientConversion, isRouterEligible
    ) VALUES ?
    ON DUPLICATE KEY UPDATE
      orignalRequirment = VALUES(orignalRequirment),
      firstPartyUrl = VALUES(firstPartyUrl),
      fees = VALUES(fees),
      loi = VALUES(loi),
      ir = VALUES(ir),
      updatedAt = VALUES(updatedAt),
      status = VALUES(status),
      isActive = VALUES(isActive),
      device = VALUES(device),
      EPC = VALUES(EPC),
      clientSurveyGUID = VALUES(clientSurveyGUID),
      isgroupsecurityactive = VALUES(isgroupsecurityactive),
      allowDemo = VALUES(allowDemo),
      isPIIActive = VALUES(isPIIActive),
      studytypes = VALUES(studytypes),
      categoryId = VALUES(categoryId),
      lucidClientName = VALUES(lucidClientName),
      lucidClientConversion = VALUES(lucidClientConversion),
      isRouterEligible = VALUES(isRouterEligible)
  `;

  // Sort rows by apiSurveyId to reduce deadlocks
  surveysData.sort((a, b) => a[16] - b[16]);

  let i = 0;
  while (i < surveysData.length) {
    let batchSize = initialBatchSize;
    let attempts = 0;
    let success = false;

    while (!success && batchSize > 0 && attempts < maxAttempts) {
      const chunk = surveysData.slice(i, i + batchSize);

      try {
        let data = await executeDev7(query, [chunk]);
        success = true;
        i += batchSize; // move to next batch
      } catch (err) {
        if (err.code === "ER_LOCK_DEADLOCK") {
          attempts++;
          batchSize = Math.floor(batchSize / 2) || 1; // halve batch size
          const delay = 50 + Math.floor(Math.random() * 100); // random 50-150ms
          console.warn(`Deadlock detected. Retry ${attempts}, new batch size ${batchSize}, delaying ${delay}ms`);
          await new Promise(r => setTimeout(r, delay));
        } else {
          throw err; // other errors, rethrow
        }
      }
    }

    if (!success) {
      throw new Error(`Failed to insert batch starting at index ${i} after ${maxAttempts} attempts`);
    }
  }

  return { status: "ok" };
}




async function upsertLucidGlobalSurveyData(surveyBulkData){
  try{
    const query = "INSERT INTO lucidsurveylistall (AccountName,BidIncidence,BidLengthOfInterview,CPI,CollectsPII,CompletionPercentage,Conversion,CountryLanguageID,FieldEndDate,IndustryID,IsOnlySupplierInGroup,IsTrueSample,LengthOfInterview,OverallCompletes,SampleTypeID,StudyTypeID,SurveyGroup,SurveyGroupExists,SurveyGroupID,SurveyMobileConversion,SurveyName,SurveyNumber,SurveyQuotaCalcTypeID,SurveySID,TerminationLengthOfInterview,TotalRemaining,status) VALUES ? ON DUPLICATE KEY UPDATE BidIncidence = VALUES(BidIncidence), BidLengthOfInterview = VALUES(BidLengthOfInterview), CPI = VALUES(CPI),FieldEndDate = VALUES(FieldEndDate),LengthOfInterview = VALUES(LengthOfInterview),OverallCompletes = VALUES(OverallCompletes),SurveyGroupExists = VALUES(SurveyGroupExists),TerminationLengthOfInterview = VALUES(TerminationLengthOfInterview),TotalRemaining = VALUES(TotalRemaining)";
    const result = await execute(query, [surveyBulkData]);
    return result;
  }catch(error){
    throw new Error("oops SOmething went wrong, please contact to support!")
  }
}

async function upsertLucidGlobalSurveyDataAllowcational(surveyBulkData){
  try{
    const query = "INSERT INTO lucidsurveylistall (AccountName,BidIncidence,BidLengthOfInterview,CollectsPII,Conversion,CountryLanguageID,FieldBeginDate,FieldEndDate,IndustryID,IsTrueSample,LengthOfInterview,Priority,SampleTypeID,StudyTypeID,SurveyGroup,SurveyGroupExists,SurveyGroupID,SurveyMobileConversion,SurveyName,SurveyNumber,SurveyQuotaCalcTypeID,SurveySID,TerminationLengthOfInterview,status) VALUES ? ON DUPLICATE KEY UPDATE BidIncidence = VALUES(BidIncidence), BidLengthOfInterview = VALUES(BidLengthOfInterview), FieldEndDate = VALUES(FieldEndDate),LengthOfInterview = VALUES(LengthOfInterview),SurveyGroupExists = VALUES(SurveyGroupExists),TerminationLengthOfInterview = VALUES(TerminationLengthOfInterview)";
    const result = await execute(query, [surveyBulkData]);
    return result;
  }catch(error){
    throw new Error("oops SOmething went wrong, please contact to support!")
  }
}

async function upsertStudiesDataAllowcational(surveysData) {
  const initialBatchSize = 200; // start batch size
  const maxAttempts = 3;       // max retry attempts per batch

  const query = `
    INSERT INTO studies (
      _id, studyName, description, status, loi, ir, isActive, apiType, country, lang_code, 
      apiClientId, client, apiSurveyId, surveyEndDate, device, isCountryCheck, isgroupsecurityactive, 
      allowDemo, isPIIActive, studytypes, isSampleChainReview, vendorSharedQuota, clientType, 
      categoryId, lucidClientName, lucidClientConversion
    ) VALUES ?
    ON DUPLICATE KEY UPDATE
      loi = VALUES(loi),
      ir = VALUES(ir),
      updatedAt = VALUES(updatedAt),
      status = VALUES(status),
      isActive = VALUES(isActive),
      device = VALUES(device),
      EPC = VALUES(EPC),
      clientSurveyGUID = VALUES(clientSurveyGUID),
      isgroupsecurityactive = VALUES(isgroupsecurityactive),
      allowDemo = VALUES(allowDemo),
      isPIIActive = VALUES(isPIIActive),
      studytypes = VALUES(studytypes),
      categoryId = VALUES(categoryId),
      lucidClientName = VALUES(lucidClientName),
      lucidClientConversion = VALUES(lucidClientConversion)
  `;

  // Optional: sort by apiSurveyId to reduce deadlocks
  surveysData.sort((a, b) => a[12] - b[12]);

  let i = 0;

  while (i < surveysData.length) {
    let batchSize = initialBatchSize;
    let attempts = 0;
    let success = false;

    while (!success && batchSize > 0 && attempts < maxAttempts) {
      const chunk = surveysData.slice(i, i + batchSize);

      try {
        await executeDev7(query, [chunk]);
        success = true;
        i += batchSize;
      } catch (err) {
        if (err.code === "ER_LOCK_DEADLOCK") {
          attempts++;
          batchSize = Math.max(1, Math.floor(batchSize / 2));
          const delay = 50 + Math.floor(Math.random() * 100);
          console.warn(`Deadlock detected. Retry ${attempts}, batch size ${batchSize}, delaying ${delay}ms`);
          await new Promise(r => setTimeout(r, delay));
        } else {
          console.error(err);
          throw new Error("Oops! Something went wrong, please contact support.");
        }
      }
    }

    if (!success) {
      throw new Error(`Failed to insert batch starting at index ${i} after ${maxAttempts} attempts`);
    }
  }

  return { status: "ok" };
}


/**
 * Retrieves vendor data from the database based on the vendor IDs.
 * @param {Array} vIds - The vendor IDs.
 * @returns {Promise<{ success: boolean, result: Array }>} A promise that resolves to an object containing the vendor data.
 * @throws {Error} If no vendor data is found to store survey data or an error occurs during the vendor mapping process.
 */
async function getVendorData(vIds) {
  try {
    const vendorIds = vIds.join("','");
    const query = `SELECT * FROM vendors WHERE _id in ('${vendorIds}')`;
    const vendorRes = await execute(query, []);
    
    if (vendorRes.length) {
      return { success: true, result: vendorRes };
    } else {
     return  { success: false, result: [] };
    }
  } catch (error) {
    throw new Error("Oops something went wrong during vendor mapping!");
  }
}

/**
 * Retrieves all live surveys from the database based on the language code and Api Client Id.
 * @param {string} lang_code - The language code.
 * @returns {Promise<{ success: boolean, result: Array }>} A promise that resolves to an object containing the studies data.
 * @throws {Error} If an error occurs during the retrieval process.
 */
async function getAllLiveSurveyFromDb( lang_code ){
 try {
    const query = "select apiSurveyId from studies where country = ? AND apiClientId = ? AND isActive = 1 and status = ? ";
    const allStudies = await execute(query, [ lang_code , 10, 'Live']);
    
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
 * update all live surveys from the database based on the Api Client Id.
 * @param {string} lang_code - The language code.
 * @returns {Promise<{ success: boolean, result: Array }>} A promise that resolves to an object containing the studies data.
 * @throws {Error} If an error occurs during the retrieval process.
 */
async function updateAllSurveyStatus(allSurveysIds, apiClientId) {
  try{
      const allApiSurveyIds = allSurveysIds.map(d => d).join("','")
      const query = `UPDATE studies SET status = 'On Hold', isActive = 0 where apiSurveyId IN( '${allApiSurveyIds}') AND apiClientId = ?`;
      const result = await execute(query, [apiClientId]);
      return result;

    }catch( error ){
        throw new Error("Oops Something went wrong during updation study! ");
    }
}
/**
 * Pasue the live studies from the database.
 * @param {string} studyId - The language code.
 * @returns {Promise<Object>} - For update the status
 * @throws {Error} - If an error occurs while retrieving the data.
 */
async function pauseQualficationNotMatchSurvey(studyId){
  try{
    const query = 'update studies set status = "On Hold" where _id = ?';
    const result = await execute(query,[studyId]);
    return result;
  }catch(error){
    throw new Error(`Oops Something went wrong, during ${error}`)
  }
}


/**
 * Excute query from database 
 * @param {string} query - send a query to retrieve the data from the database
 * @param {Array} queryData - send a query data that retrieve from the database
 * @returns {Promise< result: Array >} A promise that resolves to the studies data.
 * @throws {Error} If an error occurs during the retrieval process.
 */
async function excuteQuery(query, queryData){
  try{
    const queryResult = await execute(query, queryData);
    return queryResult
  }catch(error){
    throw new Error("Oops Something went wrong during fetching data from database! ")
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
    const query = 'select * from demoquery where lang_code = ? and lucidQid is not null';
    const ALL_CACHED_QUALIFICATION = { key: 'getAllLucidQualification_Data', expiry: meta.noExpire };
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
    const query = 'select * from queryoptions where lang_code = ? and lucidOpId is not null';
    const ALL_CACHED_QUALIFICATION = { key: 'getAllLucidOption_cache', expiry: meta.noExpire };
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
    const result = await execute(query, [data]);
    return result;
  } catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
  }
}

async function upsertGlobaleDemoDB(data) {
  try {
    const query = `insert into lucidglobalqualifications(sqid, studyId, demographicId, queryId, optionId, allText, createdAt, updatedAt, lang_code) values ? ON 
    DUPLICATE KEY UPDATE demographicId=values(demographicId), queryId=values(queryId),  optionId=values(optionId), allText=values(allText), updatedAt=(updatedAt),lang_code=values(lang_code)`;
    const result = await execute(query, [data]);
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
    const resultDemo = await execute(queryDemo, [data]);
    return resultDemo;
  } catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
  }
}

async function upsertStudyDemoOrder(data) {
  try {
    const queryDemo = `insert into projectscreenerorder(studyId, screener_id, order_no, createdAt, updatedAt, lang_code, apiUniqueId) values ? ON 
    DUPLICATE KEY UPDATE studyId=values(studyId), screener_id=values(screener_id), order_no=values(order_no), updatedAt=(updatedAt),lang_code=values(lang_code)`;
    const resultDemo = await execute(queryDemo, [data]);
    return resultDemo;
  } catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
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
      DUPLICATE KEY UPDATE  title=values(title), totalQuota=values(totalQuota), requirement=values(requirement), isActive = values(isActive), updatedAt=values(updatedAt),lang_code=values(lang_code)`;
    const responseData = await execute(query, [quotaData]);
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
    const studyIds = surveyIds.map(d => "LD"+d).join("','");
    const getAllQuotaQuery = `select id, clientQuotaId, studyId, isActive from constrainsts where studyId in ('${studyIds}')`;
    const quotaData = await execute(getAllQuotaQuery,[]);
    return quotaData;
    
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

    const result = await execute(query, [QuotaDemo]);
    return result;
  } catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
  }
}

/**
 * Upserts group surveys into the database.
 * @param {Array} groupSurveysData - The group survey data to be upserted.
 * @returns {Promise} - The result of the upsert operation.
 * @throws {Error} - If an error occurs during the upsert operation.
 */
// async function upsertGroupQuotas(groupSurveysData) {
//   try {
//     const insertQuery = 'Insert into lucidgroupsurveys (surveyId, surveyGroupId, groupSurveys, created_at, update_at) values ? ON DUPLICATE KEY UPDATE  groupSurveys = values(groupSurveys), update_at = values(update_at)';
//     const result = await execute(insertQuery, [groupSurveysData]);
//     return result;
//   } catch (error) {
//     throw new Error(`Oops Something went wrong: ${error.message}`);
//   }
// }

/**
 * Upserts vendor mapping data into the database.
 * @param {Array} vendorMappingData - The survey data to be upserted.
 *  @returns {Promise} - The result of the upsert operation.
 * @throws {Error} - If an error occurs during the upsert operation.
 */
async function upsertVendorData( vendorMappingData ){
  try {
    const InsertMappingQuery = "Insert into mappings (sidTid, studyId, thirdPartyId, _id, successUrl, terminateUrl, overQuotaUrl, securityTerminate, studyUrl, studyTestUrl, createdAt, updatedAt, requirement, totalQuota) values ? ON DUPLICATE KEY UPDATE updatedAt = values(updatedAt)";
    const response = await execute(InsertMappingQuery, [vendorMappingData]);
    return response;
  }catch(error){
    throw new Error(`Oops! something went wrong, ${error.message}`);
  }
}
/**
 * Upserts vendor mapping data into the database.
 * @param {Array} pauseUnAvailableQuotas - The survey data to be upserted.
 *  @returns {Promise} - The result of the upsert operation.
 * @throws {Error} - If an error occurs during the upsert operation.
 */
async function pauseUnAvailableQuotas( pauseUnAvailableQuotas ){
  try{
    const clientQuotaIds = pauseUnAvailableQuotas.join("','");
    const query = `Update constrainsts set isActive = 0 where clientQuotaId in ('${clientQuotaIds}')`;
    const resultResponse = await execute(query, []);
    return resultResponse;
  }catch(error){
    throw new Error(`Oops! something went wrong, ${error.message}`);

  }
}

/**
 * Upserts vendor mapping data into the database.
 * @param {Array} allStudyIds - The survey data to be update.
 * @param {String} surveyGroupId - update the survey group Id in Database
 *  @returns {Promise} - The result of the upsert operation.
 * @throws {Error} - If an error occurs during the upsert operation.
 */
async function updateGroupSurveysData( allStudyIds, surveyGroupId){
  try{
    let query = "";
    if(surveyGroupId.includes(",")){
      query = `update studies set groupsecurity = "${surveyGroupId}" where apiClientId = ? and _id in (${allStudyIds}) and isActive = 1`;
    }else{
     query = `update studies set groupsecurity = ${surveyGroupId} where apiClientId = ? and _id in (${allStudyIds}) and isActive = 1`;
    }
    const response = await execute(query, [10]);
    return response;
  }catch(error){
    throw new Error("Oops! something went wrong!", error.message);
  }
}

async function updateGroupSecurity( serveyId, groupSecurityIds){
  try{
    let query  = `update studies set groupsecurity = ? where apiClientId = ? and _id = ? and isActive = 1`;
    const response = await execute(query, [groupSecurityIds,10,serveyId]);
    return response;
  }catch(error){
    throw new Error("Oops! something went wrong!", error.message);
  }
}

async function getExistingGroupSecurityID( allStudyIds){
  try{
    let query  = `SELECT _id,groupsecurity FROM studies where _id in (${"'" + allStudyIds.join("','") + "'"}) and isActive = 1`;
    const response = await execute(query);
    return response;
  }catch(error){
    throw new Error("Oops! something went wrong!", error.message);
  }
}

async function lucidLogsEnable(type){
  try{
    const query = "select * from app_configs where configType = ? and isActive = 1";
    const response = await execute(query,[type]);
    return response;
  }catch(error){
    return [];
  }
}

async function insertLucidLogging(data){
  return new Promise(async function(resolve,reject){
    const query = "insert into lucidsupply_logs(request, response, type, created_at, count) values ?";
    const response = await execute(query,[data]);
    resolve();
  })
}

async function filterLiveAllocatedSurveys(studyIds){
  try{
    const query = `select _id from studies where apiClientId = 10 and apiSyncOnVendor = 4 and apiSurveyId in (${studyIds}) `;
    const response = await execute(query,[]);
    return response;
  }catch(error){
    return [];
  }
}

async function upsertStudyisRouterEligible(studyIds){
  try{
    const query = `update studies set isRouterEligible = 1 where _id in ('${studyIds}') `;
    const response = await execute(query,[]);
    return response;
  }catch(error){
    return [];
  }
}

async function logsUnMappedQualData(data){
  try {
    const InsertMappingQuery = "Insert into lucidQualificationLogs (sqId, studyId, qualification_id, created_at) values ? ON DUPLICATE KEY UPDATE studyId = values(studyId) , qualification_id = values(qualification_id) , created_at = values(created_at)";
    const response = await execute(InsertMappingQuery, [data]);
    return response;
  }catch(error){
    throw new Error(`Oops! something went wrong, ${error.message}`);
  }
}
async function upsertIntoUnmappedqualification(unMappedSurveyIds, unMappedQuals, lang_Codes) {
  try {
    const clientId = 10;
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

    const resultResponse = await execute(query, [dataBundle]);
    return resultResponse;
  } catch (error) {
    return `Oops! Something went wrong: ${error.message}`;
  }
}

  async function insertlogs(data,status,surveyid,clientId) {
  try {
    const query = `insert into mcqApiLog(response,status,survey_id,client_Id) values (?,?,?,?)`
    const result = await execute(query, [JSON.stringify(data),status,surveyid,clientId]);
    return result;
  } catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
  }
}

  async function insertBuyerList(list) {
  try {
    // SELECT buyername, priority FROM lucid_buyer_name_priority
    const query = `insert into lucid_buyer_name_priority(buyername, priority) values ?`
    const result = await execute(query, [list]);
    return result;
  } catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
  }
}

module.exports = { insertlogs, getLangIdFromDb, getVendorData, getAllOptionsFromDb,pauseQualficationNotMatchSurvey,upsertLucidGlobalSurveyDataAllowcational,
  getAllLiveSurveyFromDb, updateAllSurveyStatus, getAllQualificationFromDb, excuteQuery,upsertVendorData,pauseUnAvailableQuotas,
  upsertStudyDemoDb, upsertDemoAgeIntoDb, upsertStudiesData, getAllInsertedQuotas, InsertQuotaDataIntoDb , upsertLucidGlobalSurveyData,
  updateGroupSurveysData, getExistingGroupSecurityID,updateGroupSecurity , insertQuotaDemoIntoDb, upsertStudyDemoOrder, lucidLogsEnable, insertLucidLogging, upsertStudiesDataAllowcational,
  filterLiveAllocatedSurveys, upsertStudyisRouterEligible, logsUnMappedQualData, upsertGlobaleDemoDB,upsertIntoUnmappedqualification, getlucidBuyerListFromDb, insertBuyerList};