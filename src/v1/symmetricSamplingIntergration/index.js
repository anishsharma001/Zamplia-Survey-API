// const symmetricSamplingController = require('../symmetricSamplingIntergration/controller')

// module.exports = async function (context, req) {
//     symmetricSamplingController.getProjectFromApi(req, context.res);
//     context.res = {};
// }

const { getProjectFromApi } = require('./controller');

 async function symmetricSamplingIntergration(req, res) {
  try {
    let lang_code = req.query.lang_code;
    getProjectFromApi(lang_code);
   res.status(200).json({
  status: 200,
  message: 'Data processed successfully',

});
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({
  status: 400,
  message: 'Oops, something went wrong',
  error
});

  }
};
module.exports = {symmetricSamplingIntergration};

