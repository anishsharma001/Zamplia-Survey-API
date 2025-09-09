const { executeDev7 } = require('../../database/queryWrapperMysql');




async function deleteStudiesForArchiving(sids) {
    let query = 'delete from studies where apiType=1 and _id in (?)';
    let result = await executeDev7(query, [sids]);
    return result;
}
async function deleteStudiesAlreadyArchived(sids) {
    let query = 'delete from studies_backup where apiType=1 and _id in (?)';
    let result = await executeDev7(query, [sids]);
    return result;
}

async function deleteStudiesMappingForArchiving(sids) {
    let query = 'delete from mappings where studyId in(?)';
    let result = await executeDev7(query, [sids]);
    return result;
}

async function deleteStudiesDemoAgeMappingForArchiving(sids) {
    let query = 'delete from demoagemapping where studyId in(?)';
    let result = await executeDev7(query, [sids]);
    return result;
}

async function deleteStudiesDemoMappingForArchiving(sids) {
    let query = 'delete from studydemomapping where studyId in(?)';
    let result = await executeDev7(query, [sids]);
    return result;
}

async function deleteConstraintsForArchiving(sids) {
    let query = 'delete from constrainsts where studyId in(?)';
    let result = await executeDev7(query, [sids]);
    return result;
}

async function deleteConstraintsDemoMappingForArchiving(sids) {
    let query = 'delete from constrainstdemos where studyId in(?)';
    let result = await executeDev7(query, [sids]);
    return result;
}

async function deleteStudiesStatusCountForArchiving(sids) {
    let query = 'delete from studies_status_count where studyId in(?)';
    let result = await executeDev7(query, [sids]);
    return result;
}

async function deleteStudiesStatusCountOnVendorsForArchiving(sids) {
    let query = 'delete from studies_status_count_on_vendor where studyId in(?)';
    let result = await executeDev7(query, [sids]);
    return result;
}

module.exports = {
    deleteStudiesAlreadyArchived,
    deleteStudiesForArchiving,
    deleteStudiesMappingForArchiving,
    deleteStudiesDemoAgeMappingForArchiving,
    deleteStudiesDemoMappingForArchiving,
    deleteConstraintsForArchiving,
    deleteConstraintsDemoMappingForArchiving,
    deleteStudiesStatusCountForArchiving,
    deleteStudiesStatusCountOnVendorsForArchiving
};
