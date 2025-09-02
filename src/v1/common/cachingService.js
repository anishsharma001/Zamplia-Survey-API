const redis = require('../../middlewares/redisClient')
const redisArchive = require('../../middlewares/redisClientArchive');
const { map: _map, slice : _slice , filter : _filter } = require('lodash');


const NONE = -1;
const MINUTES = 1 * 60;
const THREE_MINUTES = 3 * MINUTES;
const FIVE_MINUTES = 5 * MINUTES;
const TEN_MINUTES = 10 * MINUTES;
const THIRTY_MINUTES = 30 * MINUTES;
const HOUR = 60 * MINUTES;
const SIX_HOUR = 6 * HOUR;
const TWELVE_HOUR = 12 * HOUR;
const FULL_DAY = 24 * HOUR;

const cacheKeys = {
    SURVEYS_FROM_STUDIES: { key: 'surveysFromStudies', expiry: THREE_MINUTES },
    ALL_MANUAL_STUDIES_BY_OFFSET: { key: 'manualStudiesFromStudies', expiry: FIVE_MINUTES },
    ALL_MANUAL_STUDIES_BY_OFFSET_ARCHIVE: { key: 'manualStudiesFromStudiesArchive', expiry: FIVE_MINUTES },
    ALL_PRECISION_LIVE_STUDIES: { key: 'precisionLiveStudies', expiry: THREE_MINUTES },
    LIVE_STUDIES_CLIENT: { key: 'liveStudiesByClient', expiry: THREE_MINUTES },
    ALL_CACHED_STUDIES: { key: 'allcachedStudies', expiry: THREE_MINUTES },

    COUNTRY: { key: 'country', expiry: NONE },
    GENDER: { key: 'gender', expiry: FULL_DAY },
    MARTIALSTATUS: { key: 'maritalStatus', expiry: HOUR },
    BLOODGROUP: { key: 'bloodGroup', expiry: NONE },
};

/*Name: find
 *Desc: this function get all data from country table or redis server.
 */
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


async function removeRedisCacheOnKey(key) {
    try {
        return await redis.removeOne(key);
    } catch (error) {
        return error;
    }
}

async function getAllStudyByStatus(key, query, queryParam, cacheKeyParam, userRequestData) {
    try {
        var allStudies = await redis.getData(key, query, queryParam, cacheKeyParam);
        var totalStudies = 0;

        // Here filter all the studies from  startLimit to Limit whith role based
         switch(userRequestData.userType){
            case "account_manager" : 
                    allStudies =  _filter(allStudies, function(o) { return o.bde_id == userRequestData.userID || o.created_by_id == userRequestData.userID; } );
                    totalStudies = allStudies.length;
                    allStudies =  _slice(allStudies, [start=userRequestData.startNum], [end=userRequestData.startNum + userRequestData.limit]);
                break;
            case "operation_manager" :  
                    allStudies =  _filter(allStudies, function(o) { return o.projectManager == userRequestData.userID || o.created_by_id == userRequestData.userID; } );
                    totalStudies = allStudies.length;
                    allStudies =  _slice(allStudies, [start=userRequestData.startNum], [end=userRequestData.startNum + userRequestData.limit]);
                    break;
            case "superadmin" :
                    totalStudies = allStudies.length;
                    allStudies =  _slice(allStudies, [start=userRequestData.startNum], [end=userRequestData.startNum + userRequestData.limit]);
                break;
            default :
                    allStudies =  _filter(allStudies, function(o) { return o.created_by_id == userRequestData.userID; } );
                    totalStudies = allStudies.length;
                    allStudies =  _slice(allStudies, [start=userRequestData.startNum], [end=userRequestData.startNum + userRequestData.limit]);
                break;
            }
            let returnData = {};
            returnData.success = true;
            returnData.allStudies = allStudies;
            returnData.totalStudies = totalStudies;

        return returnData;
    } catch (error) {
        let returnData = {};
        returnData.success = false;
        return returnData;
    }
}

async function getAllStudyByStatusArchive(key, query, queryParam, cacheKeyParam, userRequestData) {
    try {
        var allStudies = await redisArchive.getData(key, query, queryParam, cacheKeyParam);
        var totalStudies = 0;

        // Here filter all the studies from  startLimit to Limit whith role based
         switch(userRequestData.userType){
            case "account_manager" : 
                    allStudies =  _filter(allStudies, function(o) { return o.bde_id == userRequestData.userID || o.created_by_id == userRequestData.userID; } );
                    totalStudies = allStudies.length;
                    allStudies =  _slice(allStudies, [start=userRequestData.startNum], [end=userRequestData.startNum + userRequestData.limit]);
                break;
            case "operation_manager" :  
                    allStudies =  _filter(allStudies, function(o) { return o.projectManager == userRequestData.userID || o.created_by_id == userRequestData.userID; } );
                    totalStudies = allStudies.length;
                    allStudies =  _slice(allStudies, [start=userRequestData.startNum], [end=userRequestData.startNum + userRequestData.limit]);
                    break;
            case "superadmin" :
                    totalStudies = allStudies.length;
                    allStudies =  _slice(allStudies, [start=userRequestData.startNum], [end=userRequestData.startNum + userRequestData.limit]);
                break;
            default :
                    allStudies =  _filter(allStudies, function(o) { return o.created_by_id == userRequestData.userID; } );
                    totalStudies = allStudies.length;
                    allStudies =  _slice(allStudies, [start=userRequestData.startNum], [end=userRequestData.startNum + userRequestData.limit]);
                break;
            }
            let returnData = {};
            returnData.success = true;
            returnData.allStudies = allStudies;
            returnData.totalStudies = totalStudies;

        return returnData;
    } catch (error) {
        let returnData = {};
        returnData.success = false;
        return returnData;
    }
}

async function getAllCloneStudiesByStudy(key, query, queryParam, cacheKeyParam, userRequestData) {
    try {
        var allStudies = await redis.getData(key, query, queryParam, cacheKeyParam);
        var totalStudies = allStudies.length;

        // Here filter all the studies from  startLimit to Limit whith role based
         
        allStudies =  _slice(allStudies, [start=userRequestData.startNum], [end=userRequestData.startNum + userRequestData.limit]);
            
        let returnData = {};
        returnData.success = true;
        returnData.allStudies = allStudies;
        returnData.totalStudies = totalStudies;

        return returnData;
    } catch (error) {
        let returnData = {};
        returnData.success = false;
        return returnData;
    }
}


async function getAllCloneStudiesByStudyArchive(key, query, queryParam, cacheKeyParam, userRequestData) {
    try {
        var allStudies = await redisArchive.getData(key, query, queryParam, cacheKeyParam);
        var totalStudies = allStudies.length;

        // Here filter all the studies from  startLimit to Limit whith role based
         
        allStudies =  _slice(allStudies, [start=userRequestData.startNum], [end=userRequestData.startNum + userRequestData.limit]);
            
        let returnData = {};
        returnData.success = true;
        returnData.allStudies = allStudies;
        returnData.totalStudies = totalStudies;

        return returnData;
    } catch (error) {
        let returnData = {};
        returnData.success = false;
        return returnData;
    }
}




//added priyanshu
async function getLiveStudiesByClient(key, query, queryParam, cacheKeyParam,userRequestData) {
    try {

      
        var studies = await redis.getData(key, query, queryParam, cacheKeyParam);
        totalStudies = studies.length;
        studies =  _slice(studies, [start=userRequestData.startNum], [end=userRequestData.startNum + userRequestData.limit]);
        
        let returnData = {};
        returnData.success = true;
        returnData.allStudies = studies;
        returnData.totalStudies=totalStudies;
        

        return returnData;
    } catch (error) {
        let returnData = {};
        returnData.success = false;
        return returnData;
    }
}


//added priyanshu
async function getAllCachedStudies(key, query, queryParam, cacheKeyParam,userRequestData) {
    try {
        userRequestData={};
        var studies = await redis.getData(key, query, queryParam, cacheKeyParam);
        totalStudies = studies.length;
        
        
        let returnData = {};
        returnData.success = true;
        returnData.allStudies = studies;
        returnData.totalStudies=totalStudies;
        

        return returnData;
    } catch (error) {
        let returnData = {};
        returnData.success = false;
        return returnData;
    }
}



async function getQueryData(key, query, queryParam, cacheKeyParam) {
    try {
        var queryResult = await redis.getData(key, query, queryParam, cacheKeyParam);
        
        let returnData = {};
        returnData.success = true;
        returnData.result = queryResult;

        return returnData;
    } catch (error) {
        let returnData = {};
        returnData.success = false;
        return returnData;
    }
}

module.exports = {
    getAllSurveyFromDbStudies,
    getAllStudyByStatus,
    getAllStudyByStatusArchive,
    getAllCloneStudiesByStudy,
    getAllCloneStudiesByStudyArchive,
    getQueryData,
    cacheKeys,
    removeRedisCacheOnKey,
    getLiveStudiesByClient,
    getAllCachedStudies
};