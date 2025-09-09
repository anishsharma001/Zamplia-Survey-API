const { getStudiesForArchiving, getStudiesMappingForArchiving, getStudiesDemoMappingForArchiving, getStudiesDemoAgeMappingForArchiving, getConstraintsForArchiving, getConstraintsDemoMappingForArchiving, getStudiesStatusCountForArchiving, getStudiesStatusCountOnVendorsForArchiving, insertStudiesArchive, get_studies_already_archived, insertStudyDemoArchive, insertStudyDemoAgeArchive, insertConstraintsArchive, insertDemoConstraintsArchive, insertStudiesStatusCountArchive, insertMappingArchive, updateArchivedFlagInStudies, insertStudiesStatusCountOnVendorsArchive} = require('../dao');
const { deleteStudiesForArchiving,deleteStudiesAlreadyArchived,deleteStudiesMappingForArchiving,deleteStudiesDemoAgeMappingForArchiving,deleteStudiesDemoMappingForArchiving,deleteConstraintsForArchiving,deleteConstraintsDemoMappingForArchiving,deleteStudiesStatusCountForArchiving,deleteStudiesStatusCountOnVendorsForArchiving } = require('../utillisForDeleteData');


async function archivingStudiesData(req, res) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 1000;

    const studies_For_Archive = await getStudiesForArchiving(limit);
    if (!studies_For_Archive.length) return;

    const ids = studies_For_Archive.map(({ _id }) => _id);
    const [
      studies_already_archived,
      mapping_For_Archive,
      studydemo_For_Archive,
      studydemo_age_For_Archive,
      constraints_For_Archive,
      demo_constraints_For_Archive,
      studies_status_count_For_Archive,
      studies_status_count_on_vendors_For_Archive
    ] = await Promise.all([
      get_studies_already_archived(ids),
      getStudiesMappingForArchiving(ids),
      getStudiesDemoMappingForArchiving(ids),
      getStudiesDemoAgeMappingForArchiving(ids),
      getConstraintsForArchiving(ids),
      getConstraintsDemoMappingForArchiving(ids),
      getStudiesStatusCountForArchiving(ids),
      getStudiesStatusCountOnVendorsForArchiving(ids)
    ]);

    if (studies_already_archived.length) {
      const idsForDelete = studies_already_archived.map(({ _id }) => _id);
      await deleteStudiesAlreadyArchived(idsForDelete);
    }

    const archiveTasks = [
      [studies_For_Archive, insertStudiesArchive, deleteStudiesForArchiving],
      [mapping_For_Archive, insertMappingArchive, deleteStudiesMappingForArchiving],
      [studydemo_For_Archive, insertStudyDemoArchive, deleteStudiesDemoMappingForArchiving],
      [studydemo_age_For_Archive, insertStudyDemoAgeArchive, deleteStudiesDemoAgeMappingForArchiving],
      [constraints_For_Archive, insertConstraintsArchive, deleteConstraintsForArchiving],
      [demo_constraints_For_Archive, insertDemoConstraintsArchive, deleteConstraintsDemoMappingForArchiving],
      [studies_status_count_For_Archive, insertStudiesStatusCountArchive, deleteStudiesStatusCountForArchiving],
      [studies_status_count_on_vendors_For_Archive, insertStudiesStatusCountOnVendorsArchive, deleteStudiesStatusCountOnVendorsForArchiving]
    ];

    for (const [data, insertFn, deleteFn] of archiveTasks) {
      if (data.length) {
        await insertFn(data);
        await deleteFn(ids);
      }
    }

    return;
  } catch (err) {
    console.error("Archiving error:", err);
    return;
  }
}

module.exports = {
    archivingStudiesData: archivingStudiesData
}