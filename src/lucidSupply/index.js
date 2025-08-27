const { surveyPulling } = require('./controller');

module.exports = async function (context, req) {
  try {
    // get lang-code from the request
    const {lang_code,CPIGTE, CPILTE,LengthOfInterviewLTE, ConversionGTE, OverallCompletesGTE, TerminationLengthOfInterviewLTE, TotalRemaining} =  req.body || req.query;


    // Call the SurveyPulling function and pass the lang code
     surveyPulling(lang_code,CPIGTE, CPILTE,LengthOfInterviewLTE, ConversionGTE, OverallCompletesGTE, TerminationLengthOfInterviewLTE, TotalRemaining);

    // Set the response
    context.res = {
      body: { success: true },
    };
  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Error:', error);
    context.res = {
      status: 500,
      body: { success: false, message: error.message || error },
    };
  }
};
