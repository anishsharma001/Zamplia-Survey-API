const { update } = require('lodash');
const { executeDev7 } = require('../../database/queryWrapperMysql');
// 
async function getStudiesForArchiving(limit) {
    let query = `select  s.* from studies as s where s.apiType=1  and s.status != 'Live' and  s.createdAt < DATE_SUB(NOW(), INTERVAL 4 MONTH) and s._id not in (SELECT studyId FROM mappings
        WHERE thirdPartyId = '2920254VENDOR1748538817552') LIMIT ?`;
    let result = await executeDev7(query, [limit]);
    return result;
}

async function get_studies_already_archived(sids) {
    let query = 'select _id  from studies_backup as s where s._id in (?)';
    let result = await executeDev7(query, [sids]);
    return result;
}

async function getStudiesMappingForArchiving(sids) {
    let query = 'select * from mappings where studyId in(?)';
    let result = await executeDev7(query, [sids]);
    return result;
}

async function getStudiesDemoAgeMappingForArchiving(sids) {
    let query = 'select * from demoagemapping as dm where dm.studyId in(?)';
    let result = await executeDev7(query, sids);
    return result;
}

async function getStudiesDemoMappingForArchiving(sids) {
    let query = 'select * from studydemomapping as sdm where sdm.studyId in(?)';
    let result = await executeDev7(query, sids);
    return result;
}

async function getConstraintsForArchiving(sids) {
    let query = 'select * from constrainsts where studyId in(?)';
    let result = await executeDev7(query, sids);
    return result;
}

async function getConstraintsDemoMappingForArchiving(sids) {
    let query = 'select * from constrainstdemos as cd where cd.studyId in(?)';
    let result = await executeDev7(query, sids);
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

async function insertStudiesArchive(studies) {
    if (!studies || studies.length === 0) return;

    const columns = Object.keys(studies[0]);

    const placeholders = studies
        .map(() => `(${columns.map(() => '?').join(',')})`)
        .join(',');
    const values = studies.flatMap(study => columns.map(col => study[col]));
    const query = `INSERT INTO studies_backup (${columns.join(',')}) VALUES ${placeholders}`;
    let data = await executeDev7(query, values);
    return
}

async function insertMappingArchive(mappings) {
    if (!mappings || mappings.length === 0) return;

    // Exclude auto_increment key m_id
    const columns = Object.keys(mappings[0]).filter(col => col !== 'm_id');

    const placeholders = mappings
        .map(() => `(${columns.map(() => '?').join(',')})`)
        .join(',');

    const values = mappings.flatMap(map => columns.map(col => map[col]));

    const query = `INSERT INTO mappings_backup (${columns.join(',')}) VALUES ${placeholders}`;

    let data = await executeDev7(query, values);
    return data;
}

async function insertStudyDemoArchive(studyDemos) {
    if (!studyDemos || studyDemos.length === 0) return;

    // Exclude auto_increment key `id`
    const columns = Object.keys(studyDemos[0]).filter(col => col !== 'id');

    const placeholders = studyDemos
        .map(() => `(${columns.map(() => '?').join(',')})`)
        .join(',');

    const values = studyDemos.flatMap(sd => columns.map(col => sd[col]));

    const query = `INSERT INTO studydemomapping_backup (${columns.join(',')}) VALUES ${placeholders}`;

    let data = await executeDev7(query, values);
    return data;
}

async function insertStudyDemoAgeArchive(studyDemoAges) {
    if (!studyDemoAges || studyDemoAges.length === 0) return;

    // Exclude auto_increment key `id`
    const columns = Object.keys(studyDemoAges[0]).filter(col => col !== 'id');

    const placeholders = studyDemoAges
        .map(() => `(${columns.map(() => '?').join(',')})`)
        .join(',');

    const values = studyDemoAges.flatMap(sd => columns.map(col => sd[col]));

    const query = `INSERT INTO demoagemapping_backup (${columns.join(',')}) VALUES ${placeholders}`;

    let data = await executeDev7(query, values);
    return data;
}

async function insertConstraintsArchive(constraints) {
    if (!constraints || constraints.length === 0) return;

    // Exclude auto_increment key `id`
    const columns = Object.keys(constraints[0]).filter(col => col !== 'id');

    const placeholders = constraints
        .map(() => `(${columns.map(() => '?').join(',')})`)
        .join(',');

    const values = constraints.flatMap(c => columns.map(col => c[col]));

    const query = `INSERT INTO constrainsts_backup (${columns.join(',')}) VALUES ${placeholders}`;

    let data = await executeDev7(query, values);
    return data;
}

async function insertDemoConstraintsArchive(demoConstraints) {
    if (!demoConstraints || demoConstraints.length === 0) return;

    // Exclude `id` to avoid duplicate PK errors
    const columns = Object.keys(demoConstraints[0]).filter(col => col !== 'id');

    const placeholders = demoConstraints
        .map(() => `(${columns.map(() => '?').join(',')})`)
        .join(',');

    const values = demoConstraints.flatMap(dc => columns.map(col => dc[col]));

    const query = `INSERT INTO constrainstdemos_backup (${columns.join(',')}) VALUES ${placeholders}`;

    return await executeDev7(query, values);
}

async function insertStudiesStatusCountArchive(statusCounts) {
    if (!statusCounts || statusCounts.length === 0) return;

    const columns = Object.keys(statusCounts[0]);

    const placeholders = statusCounts
        .map(() => `(${columns.map(() => '?').join(',')})`)
        .join(',');

    const values = statusCounts.flatMap(sc => columns.map(col => sc[col]));

    // Update only some fields if duplicate _id exists
    const updateColumns = columns.filter(col => col !== '_id').map(col => `${col} = VALUES(${col})`).join(', ');

    const query = `
        INSERT INTO studies_status_count_backup (${columns.join(',')})
        VALUES ${placeholders}
        ON DUPLICATE KEY UPDATE ${updateColumns}
    `;


    let data = await executeDev7(query, values);
    return
}

async function insertStudiesStatusCountOnVendorsArchive(statusCounts) {
    if (!statusCounts || statusCounts.length === 0) return;

    const columns = Object.keys(statusCounts[0]);

    const placeholders = statusCounts
        .map(() => `(${columns.map(() => '?').join(',')})`)
        .join(',');

    const values = statusCounts.flatMap(sc => columns.map(col => sc[col]));

    // Update all columns except primary key (_id) if duplicate
    const updateColumns = columns.filter(col => col !== '_id').map(col => `${col} = VALUES(${col})`).join(', ');

    const query = `
        INSERT INTO studies_status_count_on_vendor_backup (${columns.join(',')})
        VALUES ${placeholders}
        ON DUPLICATE KEY UPDATE ${updateColumns}
    `;

    let data = await executeDev7(query, values);
    return data;
}

async function updateArchivedFlagInStudies(sids) {
    let query = 'update studies set isArchived=1 where apiType=1 and _id in (?)';
    let result = await executeDev7(query, [sids]);
    return result;

}

async function getParticipantsForArchiving(limit) {
    let query = 'Select * from participants where createdAt < DATE_SUB(NOW(), INTERVAL 6 MONTH) LIMIT ?';
    let result = await executeDev7(query, [limit]);
    return result;

}

async function get_participants_already_archived(participant_ids) {
    let query = 'Select p_id from participants_backup where p_id in (?)';
    let result = await executeDev7(query, [participant_ids]);
    return result;
}

async function getUserEntryDetailData(limit) {
    let query = 'Select * from userentrydetails where createdAt < DATE_SUB(NOW(), INTERVAL 6 MONTH) LIMIT ?';
    let result = await executeDev7(query, [limit]);
    return result;
}

async function getSurveyParticipantData(limit) {
    let query = 'Select * from survey_participants  where created_at < DATE_SUB(NOW(), INTERVAL 3 MONTH) LIMIT ?';
    let result = await executeDev7(query, [limit]);
    return result;
}



async function insertParticipantsArchive(participants) {

    if (!participants || participants.length === 0) return;

    const columns = Object.keys(participants[0]);

    const placeholders = participants
        .map(() => `(${columns.map(() => '?').join(',')})`)
        .join(',');
    const values = participants.flatMap(participant => columns.map(col => participant[col]));
    const query = `INSERT INTO participants_backup (${columns.join(',')}) VALUES ${placeholders}`;
    let data = await executeDev7(query, values);
    return
}

async function insertUserEntryDetailArchive(userEntryDetails) {
    if (!userEntryDetails || userEntryDetails.length === 0) return;


    const columns = Object.keys(userEntryDetails[0]).filter(col => col !== 'ID');

    const placeholders = userEntryDetails
        .map(() => `(${columns.map(() => '?').join(',')})`)
        .join(',');

    const values = userEntryDetails.flatMap(detail => columns.map(col => detail[col]));

    const query = `INSERT INTO userentrydetailsarchive (${columns.join(',')}) VALUES ${placeholders}`;

    let data = await executeDev7(query, values);
    return data;

}

async function insertSurveyParticipantArchive(surveyParticipants) {
    if (!surveyParticipants || surveyParticipants.length === 0) return;
    const columns = Object.keys(surveyParticipants[0]).filter(col => col !== 'id');

    const placeholders = surveyParticipants
        .map(() => `(${columns.map(() => '?').join(',')})`)
        .join(',');

    const values = surveyParticipants.flatMap(detail => columns.map(col => detail[col]));

    const query = `INSERT INTO survey_participants_backup (${columns.join(',')}) VALUES ${placeholders}`;

    let data = await executeDev7(query, values);
    return data;

}


async function getSurveyParticipant_url_Data(ids) {
    let query = 'Select * from survey_participant_urls where participant_id in (?)';
    let result = await executeDev7(query, [ids]);
    return result;
}

async function insertSurveyParticipantUrlArchive(surveyParticipants) {
    if (!surveyParticipants || surveyParticipants.length === 0) return;
    const columns = Object.keys(surveyParticipants[0]).filter(col => col !== 'id');

    const placeholders = surveyParticipants
        .map(() => `(${columns.map(() => '?').join(',')})`)
        .join(',');

    const values = surveyParticipants.flatMap(detail => columns.map(col => detail[col]));

    const query = `INSERT INTO survey_participant_urls_backup (${columns.join(',')}) VALUES ${placeholders}`;

    let data = await executeDev7(query, values);
    return data;

}





module.exports = {
    getStudiesForArchiving,
    getStudiesMappingForArchiving,
    getStudiesDemoAgeMappingForArchiving,
    getStudiesDemoMappingForArchiving,
    getConstraintsForArchiving,
    getConstraintsDemoMappingForArchiving,
    getStudiesStatusCountForArchiving,
    getStudiesStatusCountOnVendorsForArchiving,
    insertStudiesArchive,
    get_studies_already_archived,
    insertMappingArchive,
    insertStudyDemoArchive,
    insertStudyDemoAgeArchive,
    insertConstraintsArchive,
    insertDemoConstraintsArchive,
    insertStudiesStatusCountArchive,
    insertStudiesStatusCountOnVendorsArchive,
    updateArchivedFlagInStudies,
    getParticipantsForArchiving,
    getUserEntryDetailData,
    getSurveyParticipantData,
    insertParticipantsArchive,
    insertUserEntryDetailArchive,
    insertSurveyParticipantArchive,
    get_participants_already_archived,
    getSurveyParticipant_url_Data,
    insertSurveyParticipantUrlArchive
};
