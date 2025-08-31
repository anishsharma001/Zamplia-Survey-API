const { insertSurveysIntoDb } = require('./insertSurveysIntoDb');

async function sagoPulling(req, res) {
    let resultToReturn = await insertSurveysIntoDb(req, res);
    res.status(200).send({ success: true, message: "Request completed successfully" });
}

module.exports = { sagoPulling };