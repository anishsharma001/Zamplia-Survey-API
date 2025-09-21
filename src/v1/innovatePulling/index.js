const getSurveyDetails = require('./services/getInnovateSurveysFromServer')
var appConstants = require('../common/appConstants');
const getDbSurveys = require('../unimrktPulling/dao/getAllApiSurveyFromDbStudies');
const upsertIntoStudies = require('./dao/upsertInnovateSurveysIntoStudies');
const innovateDao = require('./dao/surveyToPause')
// const innovateDaoMapping = require('./dao/vendorMappings')
// const { deletePulledStudies } = require('../mcqCrons/comman')
const _ = require('lodash');
const { getZampliaDemos } = require('./dao/getDemosFromZamplia')
const upsertGroupQuotas = require('./dao/upsertGroupQuotas')
// const syncStudies = require('./services/syncStudiesOnVendor');
const moment = require('moment');
const { executeDev7 } = require('../../database//queryWrapperMysql');
async function insertInnovateSurveyInDb  (req, res) {
	createInnovateSurvey();
	return res.status(200).json({
		body: "Api is working!",
	});
}

module.exports.insertInnovateSurveyInDb = insertInnovateSurveyInDb;

async function createInnovateSurvey () {
	try{
		const allSurveys = await getSurveyDetails.getInnovateSurveyFromServer();
		if (allSurveys.success) {
			let language = await getCountryLanguage();

			// if language not found then request return from here!
			if(!language.length){
				return { success : false, message :"No language found!"}
			}
			// let surveys = allSurveys.surveys.filter(survey => {
			// 	const lang = language.find(lang => lang.countryCode == survey.CountryCode
			// 		// && lang.languageName.toLowerCase() == survey.Language.toLowerCase() && survey.CPI >= 0.01 && survey.IR >= 80 && survey.LOI <= 20 && survey.isPIIRequired == false
			// 	)
			// 	return lang != null;
			// });

			let surveys = allSurveys.surveys.filter(survey => {
				let pickOffHourTraffic = true
				if(survey?.OffHourTraffic){
					pickOffHourTraffic = false
				}
				return  survey.LOI <= 50 && survey.IR >= 20 && survey.deviceType == "All" && pickOffHourTraffic;
			});

			
			const allSurveysToUpsert = await getSurveyUpSertData(surveys);
			const allSurveyIds = [...new Set(allSurveysToUpsert.map(x => x[14]))];
			const allDbSurveys = await getDbSurveys.getAllApiSurveyFromDbStudies("", appConstants.INNOVATE_SURVEY_TYPE_ID);
			let surveysToPause = _.difference(allDbSurveys, allSurveyIds);
			await upsertIntoStudies.upsertSurveysIntoStudies(allSurveysToUpsert);

			if (surveysToPause.length > 0) {
				await innovateDao.surveysToPause(surveysToPause, appConstants.INNOVATE_SURVEY_TYPE_ID)
			}
			let getScreenerDetail = {};
			for (let survey in allSurveysToUpsert) {
				// innovateDaoMapping.vendorMapping(allSurveysToUpsert[survey])
				let zampliaDemos = await getZampliaDemos(allSurveysToUpsert[survey][12]);
				getScreenerDetail = await getSurveyDetails.getScreenerInfo(allSurveysToUpsert[survey][14], allSurveysToUpsert[survey][12], zampliaDemos)
				if (allSurveysToUpsert[survey][28]) { // if isSurveyQuota = true 
					getSurveyDetails.getQuotaInfo(allSurveysToUpsert[survey][14], allSurveysToUpsert[survey][12], zampliaDemos, allSurveyIds)
				}
				// getSurveyDetails.getGroupInfo(allSurveysToUpsert[survey][14], allSurveysToUpsert[survey][12])
			}

			// group security
			createGroupSurveys(surveys);
			return true;
		} else {
			return false;
		}
	}catch(error){
		return false;
	}
}

async function getSurveyUpSertData(surveys) {
	var allSurveysToUpsert = [];
	for (key in surveys) {
		const keyDataObject = surveys[key];
		const surveyId = `INN${keyDataObject.surveyId}`;
		const deviceType = keyDataObject.deviceType;
		let device = 3;
		if (deviceType == "Tablet" || deviceType == "Mobile") {
			device = 1;
		} else  if(deviceType == "Desktop"){
			device = 2;
		}

		let langCode = "En-US"
		if (keyDataObject.Language == 'ENGLISH' && keyDataObject.CountryCode == 'US') {
			langCode = "En-US";
		} else if (keyDataObject.Language == 'ENGLISH' && keyDataObject.CountryCode == 'IN') {
			langCode = "En-IN";
		} else {
			langCode = "Other";
		}

		let cpi = parseFloat(keyDataObject.CPI).toFixed(2);
		let projectStatus = 'Live';
		// let EPC = parseInt(keyDataObject.incidence_rate * cpi);
		let totalRemaining = keyDataObject.remainingN;
		let endDate = keyDataObject.expected_end_date;
		let surveyEndDate = moment(endDate, 'MM/DD/YYYY').format('YYYY-MM-DD');
		// 	// let guid = keyDataObject.SurveyGuId !== undefined ? keyDataObject.SurveyGuId : 0;
		let testEntryLink = keyDataObject.testEntryLink.length > 0 ? keyDataObject.testEntryLink : keyDataObject.entryLink;
		const dataObj = [
			surveyId, surveyId, surveyId, totalRemaining,
			keyDataObject.entryLink, testEntryLink, cpi, projectStatus,
			keyDataObject.LOI, keyDataObject.IR,1, 1, 
			langCode, appConstants.INNOVATE_SURVEY_TYPE_ID, keyDataObject.surveyId, surveyEndDate,
			device, 1, 'EPC', keyDataObject.surveyGroup ? '1' : '0', 
			"", 0, keyDataObject.isPII ? '1' : '0', langCode, 
			25, 100, 0, 30, keyDataObject.isQuota ,0
		];

		allSurveysToUpsert.push(dataObj);
	}
	return allSurveysToUpsert;
}

async function getCountryLanguage() {
  try {
    const query = `
      SELECT languageName, countryCode, ISOCode, lang_code, countryName
      FROM language
    `;
    // executeDev7 expects params as an array; empty array here
    const result = await executeDev7(query, []);
    return result;
  } catch (error) {
    console.error('Error fetching country languages:', error);
    return [];
  }
}


async function createGroupSurveys(allSurveysData) {
	try{
        let groupSurveysBundle = []
		let date = new Date();
        for( let surveyData of allSurveysData) {
            if(surveyData.duplicateSurveyIds && surveyData.duplicateSurveyIds.length > 0){
                const allSurveysGroup = surveyData.duplicateSurveyIds;
				const groupSurveys = allSurveysGroup.join(',');
                groupSurveysBundle.push(["INN" + surveyData.surveyId, groupSurveys, date, date]);
            }
        }
		if(groupSurveysBundle.length){
			await upsertGroupQuotas.upsertGroupQuotas(groupSurveysBundle);
		}
        return true;
    }catch(error){
        throw new Error("Oops Something went wrong, during survey group creation!" ,error)
    }
}