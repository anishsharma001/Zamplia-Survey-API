const { getLangIdFromDb, getAllIpsosLiveSurveyFromDb, getAllQualificationFromDb, upsertIpsosStudiesData,updateAllSurveyStatus,getAllOptionsFromDb, vendorMapping } = require('./model/ipsosModel');
const { getIpsosAllSurveys, getAllAllocatedSurveys } = require('./services/IpsosService');
//const { pauseLucidSurveys } = require('./utils/pauseSurveys');
const { createIpsosSurveyBundle, createAllVendorDataBundle } = require('./operation');
const { IpsosSurveyQualification } = require('./IpsosSurveyQualification');
const { IpsosSurveyQuota } = require('./IpsosSurveyQuota');
const {difference} = require('lodash');


async function IpsosSupply(lang_code) {
  try {
    // Get lucid country id from the database by lang code
    const { Ipsos } = await getLangIdFromDb(lang_code);

    let allSurveys = await getIpsosAllSurveys(Ipsos);

    let surveyBundleData = await createIpsosSurveyBundle(allSurveys, lang_code);

    // Check for paused studies
    let allIncomingSurveyIds = [...new Set(surveyBundleData[1].map((x) => x[0]))];
    let allDbSurveys = await getAllIpsosLiveSurveyFromDb(lang_code);
    let surveysToPause = difference(allDbSurveys, allIncomingSurveyIds);

    if (surveyBundleData.length) {
      await upsertIpsosStudiesData(surveyBundleData[0]);
    }

    //Pause surveys
    if (surveysToPause.length) {
      updateAllSurveyStatus(surveysToPause);
    }
    const [allQualifications, allOptions] = await Promise.all([
      getAllQualificationFromDb(lang_code),
      getAllOptionsFromDb(lang_code),
    ]);

    // Process survey qualifications and quotas
    
      await IpsosSurveyQualification(surveyBundleData[0], allQualifications, allOptions, lang_code);
      await IpsosSurveyQuota(surveyBundleData[0], allQualifications, allOptions, lang_code);
    

  //  await vendorMapping(surveyBundleData[0]);

    return { success: true };
  } catch (error) {
    console.error('Survey pulling failed:', error);
    return { success: true };
  }
}

module.exports = { IpsosSupply };

