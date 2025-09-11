const { getParticipantsForArchiving, insertParticipantsArchive, insertUserEntryDetailArchive, insertSurveyParticipantArchive, getUserEntryDetailData, getSurveyParticipantData, get_participants_already_archived, getSurveyParticipant_url_Data, insertSurveyParticipantUrlArchive } = require('../dao');
const { deleteParticipantsForArchiving, deleteUserEntryDetailForArchiving, deleteSurveyParticipantForArchiving, deleteAlreadyArchivedParticipants, deleteSurveyParticipantUrlForArchiving } = require('../utillisForDeleteData');


async function archivingParticipantsData(req, res) {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 1000;


        // kick off all three queries at once
        const [
            participants_For_Archive,
            user_entry_detail_For_Archive,
            survey_participant_For_Archive
        ] = await Promise.all([
            getParticipantsForArchiving(limit),
            getUserEntryDetailData(limit),
            getSurveyParticipantData(limit)

        ]);

        // extract the IDs
        const participant_ids = participants_For_Archive.map(r => r.p_id);
        const user_entry_detail_ids = user_entry_detail_For_Archive.map(r => r.ID);
        const survey_participant_ids = survey_participant_For_Archive.map(r => r.id);

        const [
            survey_participant_urls,
            participants_already_archived
        ] = await Promise.all([
            getSurveyParticipant_url_Data(participant_ids),
            get_participants_already_archived(participant_ids)
        ]);

        if (participants_already_archived.length) {
            await deleteAlreadyArchivedParticipants(participant_ids);
        }


        const archiveTasks = [
            [participants_For_Archive, insertParticipantsArchive, deleteParticipantsForArchiving, participant_ids],
            [user_entry_detail_For_Archive, insertUserEntryDetailArchive, deleteUserEntryDetailForArchiving, user_entry_detail_ids],
            [survey_participant_For_Archive, insertSurveyParticipantArchive, deleteSurveyParticipantForArchiving, survey_participant_ids],
            [survey_participant_urls, insertSurveyParticipantUrlArchive, deleteSurveyParticipantUrlForArchiving, participant_ids]
        ];

        for (const [data, insertFn, deleteFn, ids] of archiveTasks) {
            if (data.length) {
                await insertFn(data);
                await deleteFn(ids);
            }
        }


        return
    } catch (error) {
        console.error("Archiving error:", error);
        return;
    }
}
module.exports = {
    archivingParticipantsData: archivingParticipantsData
}
