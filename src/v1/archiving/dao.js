const { executeDev7 } = require('../../database/queryWrapperMysql');

async function getStudiesForArchiving(limit) {
    let query = 'select _id, s.* from studies as s where s.apiType=1 and  s.createdAt < DATE_SUB(NOW(), INTERVAL 2 MONTH) LIMIT ?';
    let result = await executeDev7(query, [limit]);
    return result;
}

async function getStudiesMappingForArchiving(sids) {
    let query = 'select * from mappings where studyId in(?)';
    let result = await executeDev7(query, [sids]);
    return result;
}

async function getStudiesDemoAgeMappingForArchiving(sids) {
    let query = 'select * from demoagemapping as dm where dm.studyId in(?)';
    let result = await executeDev7(query, [sids]);
    return result;
}

async function getStudiesDemoMappingForArchiving(sids) {
    let query = 'select * from studydemomapping as sdm where sdm.studyId in(?)';
    let result = await executeDev7(query, [sids]);
    return result;
}

async function getConstraintsForArchiving(sids) {
    let query = 'select * from constrainsts where studyId in(?)';
    let result = await executeDev7(query, [sids]);
    return result;
}

async function getConstraintsDemoMappingForArchiving(sids) {
    let query = 'select * from constrainstdemos as cd where cd.studyId in(?)';
    let result = await executeDev7(query, [sids]);
    return result;
}

async function getStudiesStatusCountForArchiving(sids) {
    let query = 'select * from studies_status_count as ssc where ssc.studyId in(?)';
    let result = await executeDev7(query, [sids]);
    return result;
}

async function getStudiesStatusCountOnVendorsForArchiving(sids) {
    let query = 'select * from studies_status_count_on_vendor as sscv where sscv.studyId in(?)';
    let result = await executeDev7(query, [sids]);
    return result;
}

module.exports = {
    getStudiesForArchiving,
    getStudiesMappingForArchiving,
    getStudiesDemoAgeMappingForArchiving,
    getStudiesDemoMappingForArchiving,
    getConstraintsForArchiving,
    getConstraintsDemoMappingForArchiving,
    getStudiesStatusCountForArchiving,
    getStudiesStatusCountOnVendorsForArchiving
};
