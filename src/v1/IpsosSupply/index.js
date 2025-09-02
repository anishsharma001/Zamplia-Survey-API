const { IpsosSupply } = require('./controller');

async function IpsosPulling(req,res) {
  try {
    // get lang-code from the request
    const { lang_code } = req.query


    // Call the SurveyPulling function and pass the lang code
    IpsosSupply(lang_code);

    res.status(200).json({
      status: 200,
      message: 'Data processed successfully',

    });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Error:', error);
    res.status(400).json({
      status: 400,
      message: 'Oops, something went wrong',
      error
    });

  }
}
module.exports = { IpsosPulling };
