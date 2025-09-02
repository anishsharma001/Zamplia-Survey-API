// BioBrainPulling/index.js
const { getProjectFromApi } = require('./controller');

async function BioBrainPulling(req, res) {
  try {
    const languageMap = [
      "English-GB",
      "French-FR",
      "En-US",
      "English-CA",
      "German-DE",
      "Italian-IT",
      "Spanish-ES",
      "English-AU",
      "English-NZ",
      "English-IE",
      "French-CA",
      "Dutch-NL",
      "German-CH",
      "Korean-KR",
      "Chinese-CN",
      "Spanish-MX",
      "English-SG",
      "English-IN",
      "Thai-TH",
      "German-AT",
      "Hindi-IN",
      "Chinese-HK",
      "English-HK",
      "Spanish-US",
      "Spanish-SV",
      "Spanish-PY",
      "Spanish-PR",
      "Spanish-PA",
      "Spanish-UY",
      "Spanish-GT",
      "Spanish-EC",
      "Swedish-SE",
      "Polish-PL",
      "Arabic-AE",
      "Arabic-SA",
      "Danish-DK",
      "English-MY",
      "English-ZA",
      "French-CH",
      "Greece-Greek",
      "Malay-MY",
      "Norwegian-NO",
      "Portuguese-BR",
      "Romanian-RO",
      "Spanish-AR",
      "Spanish-CL",
      "Spanish-CO",
      "Turkish-TR",
      "Arabic-EG",
      "Arabic-OM",
      "Arabic-QA",
      "Bulgaria-BG",
      "Croatian-HR",
      "English-PH",
      "Finnic-fi",
      "Hungarian-HU",
      "Indonesian-ID",
      "Mandarin-TW",
      "Serbian-RS",
      "Slovene-SI"
    ]

    languageMap.forEach(lang => {
      getProjectFromApi(lang);
    });

   res.status(200).json({
  status: 200,
  message: 'Data processed successfully'

});
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
  status: 500,
  message: 'something went wrong',
  
});
  }
};
module.exports ={
  BioBrainPulling:BioBrainPulling
}
