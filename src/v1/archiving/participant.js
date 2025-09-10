const { archivingParticipantsData } = require('./controller/participantController');
async function archivingParticipants(req, res) {
    try {

        archivingParticipantsData(req,res);
        res.status(200).json({ success: true });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message || error });
    }
}

module.exports = {
    archivingParticipants: archivingParticipants
}



