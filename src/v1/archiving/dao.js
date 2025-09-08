const { executeDev7 } = require('../../database/queryWrapperMysql');
const { map: _map, slice: _slice, filter: _filter, throttle } = require('lodash');
const meta = require('../../config/meta.json');
const redis = require('../../middlewares/redisClient');


export async function getStudiesForArchiving(date) {
    let query = 'select _id, s.* from studies as s where s.apiType=1 and  s.createdAt < DATE_SUB(?, INTERVAL 2 MONTH)';
    let result = await executeDev7(query, [date]);
    return result;
}

export async function getStudiesMappingForArchiving(date) {
    let query = 'select s._id,m.* from studies as s left join mappings as m  on s._id = m.studyId where s.apiType=1 and s.createdAt < DATE_SUB(?, INTERVAL 2 MONTH);';
    let result = await executeDev7(query, [date]);
    return result;
}
export async function getStudiesDemoAgeMappingForArchiving(date) {
    let query = 'select s._id,dm.* from studies as s left join demoagemapping as dm  on s._id=dm.studyId where s.apiType=1 and s.createdAt < DATE_SUB(?, INTERVAL 2 MONTH);';
    let result = await executeDev7(query, [date]);
    return result;
}
export async function getStudiesDemoMappingForArchiving(date) {
    let query = 'select s._id,sdm.* from studies as s left join studydemomapping as sdm  on s._id=sdm.studyId where s.apiType=1 and s.createdAt < DATE_SUB(?, INTERVAL 2 MONTH);';
    let result = await executeDev7(query, [date]);
    return result;
}
export async function getConstraintsForArchiving(date) {
    let query = 'select s._id,c.* from studies as s left join constrainsts as c  on s._id=c.studyId where s.apiType=1 and s.createdAt < DATE_SUB(?, INTERVAL 2 MONTH);';
    let result = await executeDev7(query, [date]);
    return result;
}
export async function getConstraintsDemoMappingForArchiving(date) {
    let query = ' select s._id,cd.* from studies as s left join constrainstdemos as cd on s._id=cd.studyId where s.apiType=1 and s.createdAt < DATE_SUB(?, INTERVAL 2 MONTH);';
    let result = await executeDev7(query, [date]);
    return result;
}
export async function getStudiesStatusCountForArchiving(date) {
    let query = 'select s._id,ssc.* from studies as s left join studies_status_count as ssc on s._id=ssc.studyId where s.apiType=1 and s.createdAt < DATE_SUB(?, INTERVAL 2 MONTH);';
    let result = await executeDev7(query, [date]);
    return result;
}
export async function getStudiesStatusCountOnVendorsForArchiving(date) {
    let query = 'select s._id,sscv.* from studies as s left join studies_status_count_on_vendor as sscv on s._id=sscv.studyId where s.apiType=1 and s.createdAt < DATE_SUB(?, INTERVAL 2 MONTH);';
    let result = await executeDev7(query, [date]);
    return result;
}
