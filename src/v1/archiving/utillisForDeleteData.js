const { executeDev7 } = require('../../database/queryWrapperMysql');




async function deleteStudiesForArchiving(sids) {
    let deleteLogsQuery = 'DELETE FROM logs_for_email WHERE studyId IN (?)';
    await executeDev7(deleteLogsQuery, [sids]);
    let deleteStudiesQuery = 'DELETE FROM studies WHERE apiType=1 AND _id IN (?)';
    let result = await executeDev7(deleteStudiesQuery, [sids]);

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

async function deleteParticipantsForArchiving(pids) {
    let query = 'delete from participants where p_id in(?)';
    let result = await executeDev7(query, [pids]);
    return result;
}

async function deleteAlreadyArchivedParticipants(pids) {
    let query = 'delete from participants_backup where p_id in(?)';
    let result = await executeDev7(query, [pids]);
    return result;
}

async function deleteUserEntryDetailForArchiving(ids) {
    let query = 'delete from userentrydetails where ID in(?)';
    let result = await executeDev7(query, [ids]);
    return result;
}

async function deleteSurveyParticipantForArchiving(ids) {
    let query = 'delete from survey_participant where id in(?)';
    let result = await executeDev7(query, [ids]);
    return result;
}

async function deleteSurveyParticipantUrlForArchiving(ids) {
    let query = 'delete from survey_participant_urls where participant_id in(?)';
    let result = await executeDev7(query, [ids]);
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
    deleteStudiesStatusCountOnVendorsForArchiving,
    deleteParticipantsForArchiving,
    deleteUserEntryDetailForArchiving,
    deleteSurveyParticipantForArchiving,
    deleteAlreadyArchivedParticipants,
    deleteSurveyParticipantUrlForArchiving
};
