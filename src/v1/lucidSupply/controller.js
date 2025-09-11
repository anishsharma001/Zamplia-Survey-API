const {
  getLangIdFromDb,
  getlucidBuyerListFromDb,
  getAllLiveSurveyFromDb,
  getAllQualificationFromDb,
  upsertLucidGlobalSurveyDataAllowcational,
  getAllOptionsFromDb,
  upsertVendorData,
  upsertStudiesData,
  upsertStudiesDataAllowcational,
  upsertLucidGlobalSurveyData,
  filterLiveAllocatedSurveys,
  insertBuyerList
} = require("./model/lucidmodel");
const { getLucidAllSurveys, getAllAllocatedSurveys, getallAiCategories } = require("./services/lucidServices");
const { pauseLucidSurveys } = require("./utils/pauseSurveys");
const { createSuveyBundle, createAllVendorDataBundle } = require("./operation");
const { lucidSurveyQualification } = require("./surveyQualification");
const { lucidSurveyQuota } = require("./surveyQuotas");
const {difference} = require("lodash");
const { createGroupSurveys, createGroupSurveysAllocated } = require("./groupSurveys");
const { lucidSupplyLogs } = require("./lucidLogs");
/**
 * Performs the survey pulling operation asynchronously.
 * @param {string} lang_code - The language code used for the survey pulling.
 * @returns {Promise<Object>} A Promise that resolves when the survey pulling is completed successfully, or rejects with an error.
 */




async function surveyPulling(lang_code, CPIGTE, CPILTE, LengthOfInterviewLTE, ConversionGTE, OverallCompletesGTE, TerminationLengthOfInterviewLTE, TotalRemaining) {
  try {
    // Get lucid country id from the database by lang code
    const { lucidLangId } = await getLangIdFromDb(lang_code);

    // Get all surveys based on lang id from the enpoint
    let { Surveys: allLiveSurveys } = await getLucidAllSurveys(lucidLangId, CPIGTE, CPILTE, LengthOfInterviewLTE, ConversionGTE, OverallCompletesGTE, TerminationLengthOfInterviewLTE);
    //  lucidSupplyLogs('', allSurveys.length ? allSurveys.toString() : "", 'lucid-supply-logs');
    // filter the totalRemaining  more than 90

    let getAllocatedSurveys = await getAllAllocatedSurveys(lucidLangId);
    // let completeData = await getCompletesOfLucidLink(lang_code);
    const lucidBuyerList = await getlucidBuyerListFromDb();
    allLiveSurveys = await filterSurveys(allLiveSurveys, 0, lucidBuyerList);
    getAllocatedSurveys = await filterSurveys(getAllocatedSurveys, 1, lucidBuyerList);

    let allFilterSurveys = [...allLiveSurveys, ...getAllocatedSurveys];
    if (!allFilterSurveys.length) {
      return { success: true };
    }
    // function extractTimestamp(dateString) {
    //   const matches = dateString.match(/\/Date\((\d+)([+-]\d{4})\)\//);
    //   if (!matches || matches.length < 3) {
    //     return null;
    //   }
    //   return parseInt(matches[1], 10);
    // }

    // const today = new Date();
    // const threeDaysAhead = new Date();
    // threeDaysAhead.setDate(today.getDate() + 3);

    // let allFilterSurveys = allSurveys.filter(obj => {
    //   // const fieldEndDateTimestamp = extractTimestamp(obj.FieldEndDate);

    //   let checkCompletes = completeData.filter(data => data.refid == obj.SurveyNumber);
    //   return (
    //     // fieldEndDateTimestamp !== null &&
    //     // obj.TotalRemaining > parseInt(TotalRemaining)
    //     // &&

    //     obj.AccountName !== "Logit"
    //     && obj.AccountName !== "Unimrkt Research"
    //     && obj.AccountName !== "Schlesinger Group"
    //     //&& obj.BidIncidence >= 50
    //     //&& obj.LengthOfInterview > 0
    //     //&& fieldEndDateTimestamp >= threeDaysAhead.getTime()
    //     && (checkCompletes.length > 0 || (obj.Conversion >= 20 && obj.CPI >= 0.70))
    //   );
    // });

    //  lucidSupplyLogs('', allFilterSurveys.length ? allFilterSurveys.toString() : "", 'lucid-supply-logs-after-filter');
    // Create survey bundle and vendor mapping bundle in parallel

    let surveyBundleData = await createSuveyBundle(allFilterSurveys, lang_code);
    // let vendorBundleData = await createAllVendorDataBundle(allFilterSurveys, lang_code);

    // Check for paused studies
    let allIncomingSurveyIds = [...new Set(surveyBundleData[2].map((x) => x[0]))];
    let allDbSurveys = await getAllLiveSurveyFromDb(lang_code);
    let surveysToPause = difference(allDbSurveys, allIncomingSurveyIds);

    // filter the pause quota webhook study
    const getFilterAllocatedSurveys = await filterLiveAllocatedSurveys(allIncomingSurveyIds);
    if (getFilterAllocatedSurveys.length) {
      let filterSurveys1 = surveyBundleData[0].filter((o) => getFilterAllocatedSurveys.some((o2) => o2._id == o[0]));
      let filterSurveys2 = surveyBundleData[1].filter((o) => getFilterAllocatedSurveys.some((o2) => o2._id == o[0]));
      surveyBundleData[0] = surveyBundleData[0].filter((o) => !filterSurveys1.some((o2) => o2[0] == o[0]));
      surveyBundleData[1] = surveyBundleData[1].filter((o) => !filterSurveys2.some((o2) => o2[0] == o[0]));
    }
    // upsert studies data and vendors mapping data
    if (surveyBundleData[0].length) {
      await upsertStudiesData(surveyBundleData[0]);
      getallAiCategories();
      // upsertLucidGlobalSurveyData(surveyBundleData[3])
    }
    if (surveyBundleData[1].length) {
      await upsertStudiesDataAllowcational(surveyBundleData[1]);
      // upsertLucidGlobalSurveyDataAllowcational(surveyBundleData[4])
    }
    // upsertVendorData(vendorBundleData);

    // Pause surveys
    if (surveysToPause.length) {
      // lucidSupplyLogs('', allSurveys.toString(), 'lucid-supply-pause-studies');
      pauseLucidSurveys(surveysToPause);
    }

    // lucidSupplyLogs('', JSON.stringify(allSurveys), 'lucid-upsert-studies', allSurveys.length);

    // Get all qualifications and options from the database for lucid mapping
    const [allQualifications, allOptions] = await Promise.all([getAllQualificationFromDb(lang_code), getAllOptionsFromDb(lang_code)]);

    // Process survey qualifications and quotas

    // letawait Promise.all([lucidSurveyQualification(surveyBundleData[2], allQualifications, allOptions, lang_code)]);
    // Promise.all([lucidSurveyQuota(surveyBundleData[2], allQualifications, allOptions, lang_code)]);

    let insertedQualification = await lucidSurveyQualification(surveyBundleData[2], allQualifications, allOptions, lang_code);
    lucidSurveyQuota(surveyBundleData[2], allQualifications, allOptions, lang_code, insertedQualification);

    // // Group security
    if (surveyBundleData[0].length) {
      const allSurveysData = surveyBundleData[0].filter((d) => d[20] === 1);
     await  createGroupSurveys(allSurveysData);
    }

    // // Group security
    if (surveyBundleData[1].length) {
      const allSurveysData2 = surveyBundleData[1].filter((d) => d[16] === 1);
      createGroupSurveysAllocated(allSurveysData2);
    }

    return { success: true };
  } catch (error) {
    console.error("Survey pulling failed:", error);
    return { success: true };
  }
}

async function getCompletesOfLucidLink(lang_Code) {
  return new Promise(async function (resolve, reject) {
    let query = `select count(p.p_id) as completes, p.refSID as refid
      from participants as p
      join studies as s on p.sid = s._id
      where p.apiType = 8 and p.status = 1 and p.createdAt >= DATE_SUB(current_timestamp(), INTERVAL 5 DAY)
      and s.lang_code = "${lang_Code}"
      group by p.refSID having completes > 14;`;
    queryWrapper.execute(query, [], function (checkClient) {
      if (checkClient.errno && checkClient.errno !== undefined) {
        resolve([]);
      } else {
        resolve(checkClient);
      }
    });
  });
}

async function filterSurveys(surveys, isAllowSurvey, lucidBuyerList) {
  try {
    const excludedAccounts = ["Logit", "Unimrkt Research", "Schlesinger Group", "Elicit Research", "SAGO"];
    
    let buyerListsConfig = [];
    let buyerNeedToInsert = [];

    if (lucidBuyerList.length) {
      buyerListsConfig = [
        { list: lucidBuyerList.filter((item) => item.priority === 1), threshold: 0 },
        { list: lucidBuyerList.filter((item) => item.priority === 2), threshold: 0 },
        { list: lucidBuyerList.filter((item) => item.priority === 3), threshold: 0 },
        { list: lucidBuyerList.filter((item) => item.priority === 4), threshold: 0 },
        { list: lucidBuyerList.filter((item) => item.priority === 5), threshold: 14 },
        { list: lucidBuyerList.filter((item) => item.priority === 6), threshold: 14 },
        { list: lucidBuyerList.filter((item) => item.priority === 7), threshold: 15 },
        { list: lucidBuyerList.filter((item) => item.priority === 8), threshold: 15 },
        { list: lucidBuyerList.filter((item) => item.priority === 9), threshold: 15 },
        { list: lucidBuyerList.filter((item) => item.priority === -1), threshold: 15 },
      ];
    }

    // Instead of filter(async ...)
    const results = await Promise.all(
      surveys.map(async (obj) => {
        obj.isAllowSurvey = isAllowSurvey;

        let shouldSelectSurveyBool = { isSelected: false, accountName: false };
        if (buyerListsConfig.length) {
          shouldSelectSurveyBool = await shouldSelectSurvey(obj, buyerListsConfig);
        } else {
          shouldSelectSurveyBool.isSelected =
            obj.CountryLanguageID === 9 ? obj.Conversion >= 3 : obj.Conversion >= 1;
        }

        if (shouldSelectSurveyBool?.accountName) {
          if (!buyerNeedToInsert.flat().includes(shouldSelectSurveyBool.accountName)){
            buyerNeedToInsert.push([shouldSelectSurveyBool.accountName, 9]);// priority 9 means new entry
          }
        }

        let isValid = !excludedAccounts.includes(obj.AccountName) &&
          obj.CollectsPII === false &&
          (isAllowSurvey === 0 ? obj.BidIncidence > 0 : true) &&
          (obj.RPI && obj.RPI.value > '0.90') &&
          shouldSelectSurveyBool.isSelected;

        

        if (obj.AccountName == 'Innovate MR') {
          console.log('l');
          
        }

        return isValid ? obj : null;
      })
    );

    if (buyerNeedToInsert.length) {
      await insertBuyerList(buyerNeedToInsert);
    }

    // filter out nulls
    return results.filter((item) => item !== null);

  } catch (error) {
    console.log(error);
  }
}

async function shouldSelectSurvey(obj, buyerListsConfig) {
  
  const accountName = obj.AccountName;
  const isCountryLanguage9 = obj.CountryLanguageID === 9;
    
  // Check each buyer list
  for (const { list, threshold } of buyerListsConfig) {

    if(threshold === 0 && obj.LengthOfInterview > 0) {
      return { isSelected: false, accountName: '' };
    }

    if (list.length && (list[0].priority == -1 || list[0].priority == -2 || list[0].priority >= 2)) {
      return { isSelected: false, accountName: '' };
    }
    
    let listVal = list.map(item => item.buyername);
    if (listVal.includes(accountName)) {
      console.log(list[0].priority, threshold, accountName);
      let isSelected = isCountryLanguage9 ? obj.Conversion >= threshold : obj.Conversion >= 1
      let objv = {isSelected: isSelected, accountName: ''}
      return objv
    }
  }

  
  let isSelected = isCountryLanguage9 ? obj.Conversion >= 20 : obj.Conversion >= 1
  // If not in any buyer list, check for CountryLanguageID 9 with Conversion >= 20
  let obj1 = {isSelected: isSelected , accountName: accountName};
  return obj1
}

module.exports = { surveyPulling };
 