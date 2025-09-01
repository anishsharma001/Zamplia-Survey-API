// BioBrainPulling/index.js
const { getProjectFromApi } = require('./controller');

module.exports = async function (context, req) {
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

    context.res = {
      body: { success: true },
    };
  } catch (error) {
    console.error('Error:', error);
    context.res = {
      status: 500,
      body: { success: false, message: error.message || error },
    };
  }
};

