const { getStudiesForArchiving, getStudiesMappingForArchiving, getStudiesDemoMappingForArchiving, getStudiesDemoAgeMappingForArchiving, getConstraintsForArchiving, getConstraintsDemoMappingForArchiving, getStudiesStatusCountForArchiving, getStudiesStatusCountOnVendorsForArchiving } = require('../dao');


async function archivingStudiesData(req, res) {
   try {

    let limit = req.query.limit ? parseInt(req.query.limit) : 1000;
    let studies_For_Archive = await getStudiesForArchiving(limit);
    let s_id = studies_For_Archive.map(d => d._id);
    let mapping_For_Archive = await getStudiesMappingForArchiving(s_id);
    let studydemo_For_Archive = await getStudiesDemoMappingForArchiving(s_id);
    let studydemo_age_For_Archive = await getStudiesDemoAgeMappingForArchiving(s_id);
    let constraints_For_Archive = await getConstraintsForArchiving(s_id);
    let demo_constraints_For_Archive = await getConstraintsDemoMappingForArchiving(s_id);
    let studies_status_count_For_Archive = await getStudiesStatusCountForArchiving(s_id);
    let studies_status_count_on_vendors_For_Archive = await getStudiesStatusCountOnVendorsForArchiving(s_id);
    





} catch (errno) {
    return
    }

}
module.exports = {
    archivingStudiesData: archivingStudiesData
}