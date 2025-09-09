const { getStudiesForArchiving, getStudiesMappingForArchiving, getStudiesDemoMappingForArchiving, getStudiesDemoAgeMappingForArchiving, getConstraintsForArchiving, getConstraintsDemoMappingForArchiving, getStudiesStatusCountForArchiving, getStudiesStatusCountOnVendorsForArchiving, insertStudiesArchive, get_studies_already_archived, insertStudyDemoArchive, insertStudyDemoAgeArchive, insertConstraintsArchive, insertDemoConstraintsArchive, insertStudiesStatusCountArchive, insertMappingArchive, updateArchivedFlagInStudies, insertStudiesStatusCountOnVendorsArchive} = require('../dao');
const { deleteStudiesForArchiving } = require('../utillisForDeleteData');


async function archivingStudiesData(req, res) {
   try {

    let limit = req.query.limit ? parseInt(req.query.limit) : 1000;
    let studies_For_Archive = await getStudiesForArchiving(limit);  //done
    let _id = studies_For_Archive.map(d => d._id);
    let studies_already_archived = await get_studies_already_archived(_id);
     let _id_for_delete = studies_already_archived.map(d => d._id); 
    let mapping_For_Archive = await getStudiesMappingForArchiving(_id);   // done
    let studydemo_For_Archive = await getStudiesDemoMappingForArchiving(_id); // done
    let studydemo_age_For_Archive = await getStudiesDemoAgeMappingForArchiving(_id);
    let constraints_For_Archive = await getConstraintsForArchiving(_id);
    let demo_constraints_For_Archive = await getConstraintsDemoMappingForArchiving(_id);
    let studies_status_count_For_Archive = await getStudiesStatusCountForArchiving(_id);
    let studies_status_count_on_vendors_For_Archive = await getStudiesStatusCountOnVendorsForArchiving(_id);

    if(studies_already_archived.length){
        await deleteStudiesForArchiving(_id_for_delete);
    }

    if(studies_For_Archive.length){
        await insertStudiesArchive(studies_For_Archive);
    }
    
    if(mapping_For_Archive.length){
        await insertMappingArchive(mapping_For_Archive);
    }

    if(studydemo_For_Archive.length){
        await insertStudyDemoArchive(studydemo_For_Archive);
    }

    if(studydemo_age_For_Archive.length){
        await insertStudyDemoAgeArchive(studydemo_age_For_Archive);
    }
    
    if(constraints_For_Archive.length){
        await insertConstraintsArchive(constraints_For_Archive);
    }

    if(demo_constraints_For_Archive.length){
        await insertDemoConstraintsArchive(demo_constraints_For_Archive);
    }

    if(studies_status_count_For_Archive.length){
        await insertStudiesStatusCountArchive(studies_status_count_For_Archive);
    }

    if(studies_status_count_on_vendors_For_Archive.length){
        await insertStudiesStatusCountOnVendorsArchive(studies_status_count_on_vendors_For_Archive);
    }
 
     await updateArchivedFlagInStudies(_id);

     return;
    
     

} catch (errno) {
    return
    }

}
module.exports = {
    archivingStudiesData: archivingStudiesData
}