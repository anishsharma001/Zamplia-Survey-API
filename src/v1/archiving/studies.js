const { archivingStudiesData } = require('./controller/studiesController')
async function archivingStudies(req, res) {
    try {

        archivingStudiesData(req,res);

    } catch (error) {
        res.status(500).json({ success: false, message: error.message || error });
    }
}

module.exports = {
    archivingStudies: archivingStudies
}


