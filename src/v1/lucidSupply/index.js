const { surveyPulling } = require("./controller");

async function LucidPulling(req, res) {
  try {
    // get lang-code from the request
    const { lang_code, CPIGTE, CPILTE, LengthOfInterviewLTE, ConversionGTE, OverallCompletesGTE, TerminationLengthOfInterviewLTE, TotalRemaining } = req.body || req.query;

    // Call the SurveyPulling function and pass the lang code
    surveyPulling(lang_code, CPIGTE, CPILTE, LengthOfInterviewLTE, ConversionGTE, OverallCompletesGTE, TerminationLengthOfInterviewLTE, TotalRemaining);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || error });
  }
}

module.exports = { LucidPulling };
