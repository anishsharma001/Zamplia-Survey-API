const queryWrapper = require('../../database/databaseSetupMysql');
const { executeQuery } = require('../../database/queryWrapperMysql');
const redis = require('../../middlewares/redisClient');
const meta = require('../../config/meta.json');
const appConstants = require('./appConstants');
function deletePulledStudies(_id) {
  return new Promise(function (resolve, reject) {
    let sql = "delete from pulled_studies where _id = ?";
    queryWrapper.execute(sql, [_id], function (studyDelete) {
      if (studyDelete.errno && studyDelete.errno !== undefined) {
        let returnData = {};
        returnData.success = false;
        returnData.error = studyDelete;
        returnData.message = "Error to delete pulled study";
        resolve(returnData);
      } else {
        let returnData = {};
        returnData.success = true;
        returnData.message = "Study deleted successfully";
        resolve(returnData);
      }
    });
  })
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
    return new Promise(function (resolve, reject) {
      let sql = `insert into studydemomapping(sqid, studyId, demographicId, queryId, optionId, allText, createdAt, updatedAt, lang_code, apiUniqueId) values ? ON 
    DUPLICATE KEY UPDATE demographicId=values(demographicId), queryId=values(queryId),  optionId=values(optionId), allText=values(allText), updatedAt=(updatedAt),lang_code=values(lang_code)`;
      queryWrapper.execute(sql, [data], function (data) {
        if (data.errno && data.errno !== undefined) {
          resolve([]);
        } else {
          resolve(data);
        }
      });
    })


  } catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
  }
}



async function insertlogs(data,status,surveyid) {
  try {
  
    return new Promise(function (resolve, reject) {
    let sql = "insert into mcqApiLog(response,status,survey_id) values (?,?,?)";
    queryWrapper.execute(sql, [JSON.stringify(data),status,surveyid], function (data) {
      if (data.errno && data.errno !== undefined) {
       resolve([])
      } else {
        
        resolve(data);
      }
    });
  })

  } catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
  }
}



async function upsertDemoAgeIntoDb(surveydata) {
  try {
    
    return new Promise(function (resolve, reject) {
    let sql = `insert into demoagemapping(sqid, studyId, demographicId, queryId, ageTo, ageFrom, createdAt, updatedAt, lang_code, apiUniqueId) values ? ON 
    DUPLICATE KEY UPDATE demographicId=values(demographicId), queryId=values(queryId), ageTo=values(ageTo), ageFrom=values(ageFrom), updatedAt=(updatedAt),lang_code=values(lang_code)`;
    queryWrapper.execute(sql, [surveydata], function (data) {
      if (data.errno && data.errno !== undefined) {
       resolve([])
      } else {
        
        resolve(data);
      }
    });
  })

  
  } catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
  }
}

async function upsertStudyDemoOrder(surveyData) {
  try {
     return new Promise(function (resolve, reject) {
    let sql = `insert into projectscreenerorder(studyId, screener_id, order_no, createdAt, updatedAt, lang_code, apiUniqueId) values ? ON 
    DUPLICATE KEY UPDATE studyId=values(studyId), screener_id=values(screener_id), order_no=values(order_no), updatedAt=(updatedAt),lang_code=values(lang_code)`;
    queryWrapper.execute(sql, [surveyData], function (data) {
      if (data.errno && data.errno !== undefined) {
       resolve([])
      } else {
        
        resolve(data);
      }
    });
  })

  

  } catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
  }
}

async function InsertQuotaDataIntoDb(quotaData) {
  try {
    
    return new Promise(function (resolve, reject) {
    let sql = `insert into constrainsts(sqid, clientQuotaId, studyId, type, title, totalQuota, requirement, isActive, createdAt, updatedAt, lang_code, apiUniqueQuotaId) values ? ON 
      DUPLICATE KEY UPDATE  title=values(title), totalQuota=values(totalQuota), requirement=values(requirement), isActive = values(isActive), updatedAt=(updatedAt),lang_code=values(lang_code)`;
    queryWrapper.execute(sql, [quotaData], function (data) {
      if (data.errno && data.errno !== undefined) {
       resolve([])
      } else {
        
        resolve(data);
      }
    });
  })
} catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
  }
}


async function getAllInsertedQuotas(surveyIds) {
  try {
    
  return new Promise(function (resolve, reject) {
      const studyIds = surveyIds.map(d => "MCQ" + d).join("','");
    let sql = `select id, clientQuotaId, studyId, isActive from constrainsts where studyId in ('${studyIds}')`;
    queryWrapper.execute(sql, [], function (data) {
      if (data.errno && data.errno !== undefined) {
       resolve([])
      } else {
        
        resolve(data);
      }
    });
  })

  

  } catch (error) {
    throw new Error("Oops Something wrong went during quota fetching!");
  }
}


async function insertQuotaDemoIntoDb(QuotaDemo) {
  try {
  
 return new Promise(function (resolve, reject) {
    let sql = `INSERT INTO constrainstdemos(studyId, quotaId, demographicId, quotaDemoId, optionIds, createdAt, updatedAt) 
    VALUES ?  ON DUPLICATE KEY UPDATE quotaId = VALUES(quotaId), demographicId = VALUES(demographicId), optionIds = VALUES(optionIds),  updatedAt = VALUES(updatedAt)`;
    queryWrapper.execute(sql, [QuotaDemo], function (data) {
      if (data.errno && data.errno !== undefined) {
       resolve([])
      } else {
        
        resolve(data);
      }
    });
  })

  


  } catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
  }
}


async function pauseUnAvailableQuotas(pauseUnAvailableQuotas) {
  try {
    
   return new Promise(function (resolve, reject) {
    const clientQuotaIds = pauseUnAvailableQuotas.join("','");
    let sql = `Update constrainsts set isActive = 0 where clientQuotaId in ('${clientQuotaIds}')`;
    queryWrapper.execute(sql, [JSON.stringify(data),status,surveyid], function (data) {
      if (data.errno && data.errno !== undefined) {
       resolve([])
      } else {
        
        resolve(data);
      }
    });
  })

  
  } catch (error) {
    throw new Error(`Oops! something went wrong, ${error.message}`);

  }
}

async function updateGroupSurveysData(allStudyIds, surveyGroupId) {
  try {

    return new Promise(function (resolve, reject) {
      let query = "";
      if (surveyGroupId.includes(",")) {
        query = `update studies set groupsecurity = "${surveyGroupId}" where apiClientId = ? and _id in (${allStudyIds}) and isActive = 1`;
      } else {
        query = `update studies set groupsecurity = ${surveyGroupId} where apiClientId = ? and _id in (${allStudyIds}) and isActive = 1`;
      }

      queryWrapper.execute(query, [1], function (data) {
        if (data.errno && data.errno !== undefined) {
          resolve([])
        } else {

          resolve(data);
        }
      });
    })



  } catch (error) {
    throw new Error("Oops! something went wrong!", error.message);
  }
}


async function upsertStudyisRouterEligible(studyIds) {
  try {
   
 return new Promise(function (resolve, reject) {
    let sql = `update studies set isRouterEligible = 1 where _id in ('${studyIds}') `;
    queryWrapper.execute(sql, [], function (data) {
      if (data.errno && data.errno !== undefined) {
       resolve([])
      } else {
        
        resolve(data);
      }
    });
  })


  } catch (error) {
    return [];
  }
}
async function upsertIntoUnmappedqualification(unMappedSurveyIds, unMappedQuals, lang_Codes) {
  try {
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

    // Prepare data bundle with joined qualifications and langCodes
    for (const surveyId in surveyMap) {
      const qualifications = surveyMap[surveyId].qualifications.join(',');
      const langCodes = surveyMap[surveyId].langCodes[0];
      dataBundle.push([`${surveyId}`, clientId, qualifications, langCodes, new Date()]);
    }

   
    
    
   return new Promise(function (resolve, reject) {
    let sql =  `
      INSERT INTO unmapped_api_quals (sid, cid, qualification_id, lang_code, created_at)
        VALUES ? 
        ON DUPLICATE KEY UPDATE 
        qualification_id = VALUES(qualification_id),
        lang_code = VALUES(lang_code),
        created_at = VALUES(created_at)
    `;
    queryWrapper.execute(sql, [dataBundle], function (data) {
      if (data.errno && data.errno !== undefined) {
       resolve([])
      } else {
        
        resolve(data);
      }
    });
  })


  } catch (error) {
    return `Oops! Something went wrong: ${error.message}`;
  }
}

async function upsertIntoStudies(surveyData) {
  try {
     return new Promise(function (resolve, reject) {
    let sql = `INSERT INTO studies ( _id, studyName, description, orignalRequirment, firstPartyUrl, firstPartyUrlTest, fees, status, loi, ir, isActive,  apiType, country, apiClientId, apiSurveyId,surveyEndDate,device, isCountryCheck, EPC, isgroupsecurityactive, clientSurveyGUID, allowDemo, device_v2, isPIIActive,lucidClientName, lang_code,studytypes,isRouterEligible,clientType) VALUES ?  ON DUPLICATE KEY UPDATE orignalRequirment = VALUES(orignalRequirment), firstPartyUrl = VALUES(firstPartyUrl), fees = VALUES(fees), loi = VALUES(loi),ir = VALUES(ir), updatedAt = VALUES(updatedAt), status = VALUES(status), isActive = VALUES(isActive), device = VALUES(device), EPC = VALUES(EPC), isgroupsecurityactive = VALUES(isgroupsecurityactive), clientSurveyGUID = VALUES(clientSurveyGUID), allowDemo = VALUES(allowDemo), device_v2 = VALUES(device_v2), isPIIActive = VALUES(isPIIActive), lucidClientName = VALUES(lucidClientName), lang_code = VALUES(lang_code),isRouterEligible=VALUES(isRouterEligible),clientType = VALUES(clientType)`;
    queryWrapper.execute(sql, [surveyData], function (data) {
      if (data.errno && data.errno !== undefined) {
       resolve([])
      } else {
        
        resolve(data);
      }
    });
  })
  } catch (error) {
    throw new Error(`Oops Something went wrong: ${error.message}`);
  }
}


async function updateAllSurveyStatus(allSurveys, apiClientId) {
  return new Promise(function (resolve, reject) {
    var query = "UPDATE studies SET status = 'On Hold', isActive = 0 where apiSurveyId IN( ? ) AND apiClientId = ? AND isActive = 1";
    queryWrapper.execute(query, [allSurveys, apiClientId], function (result) {
      resolve(result);
    });
  });
}

 async function insertRecord(dataQuery,record) {
    var isAvailable = [];
    var data = {};
    return new Promise(function (resolve, reject) {
        var query = dataQuery;
        queryWrapper.execute(query, [record], function (result) {
            if (result.errno && result.errno !== undefined) {
                data.result = false;
                isAvailable.push(data);
            } else {
                if (result.length > 0) {
                    data.result = true;
                    data.studyData = result;
                    isAvailable.push(data);
                } else {
                    data.result = false;
                    isAvailable.push(data);
                }
            }
            resolve(isAvailable);
        });
    });
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