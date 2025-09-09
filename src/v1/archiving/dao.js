const { update } = require('lodash');
const { executeDev7 } = require('../../database/queryWrapperMysql');
// 
async function getStudiesForArchiving(limit) {
    let query = `select  s.* from studies as s where s.apiType=1  and s.status != 'Live' and  s.createdAt < DATE_SUB(NOW(), INTERVAL 2 MONTH) LIMIT ?`;
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
    let data =  await executeDev7(query, values);
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

   
   let data= await executeDev7(query, values);
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

    let data= await executeDev7(query, values);
     return data;
}

async function updateArchivedFlagInStudies(sids) {
    let query = 'update studies set isArchived=1 where apiType=1 and _id in (?)';
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
    updateArchivedFlagInStudies
};
