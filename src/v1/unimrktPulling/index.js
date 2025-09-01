const getSurveysDetails = require('../unimrktPulling/services/getUnimrktServeyFromServer.js');
var appConstants = require('../common/appConstants');
const getDbSurveys = require('./dao/getAllApiSurveyFromDbStudies.js');
const { map: _map, slice: _slice, filter: _filter, omit: _omit } = require('lodash');
// const upsertIntoStudies = require('../cronsUtility/upsertUnimrktSurveysIntoStudies');
const mrktDao = require('../unimrktPulling/dao/surveyToPause.js')
const mrktDaoMapping = require('../unimrktPulling/dao/vendorMappings.js')
const upsertSurveyData = require('../unimrktPulling/dao/upsertSurveyData.js')
var {difference} = require('lodash');
// const { deletePulledStudies } = require('../mcqCrons/comman');
const { upsertStudiesData,existingMappings,getAllQualificationFromDb, getAllOptionsFromDb ,upsertIntoUnmappedqualification} = require('./dao/getDemosFromZamplia.js');
const { mappSurveys } = require('./dao/mappSurveys.js');
const {unimarketQualification} = require('./dao/surveyQualification');
const {unimarketQuota} = require('./dao/surveyQuota');

 async function insertUnimrktSurveysInDb (req, res) {
	try {
		let responseData = {};
		const allSurveys = await getSurveysDetails.getUnimrktServeyFromServer();
		const conversionRate = Number(req.query.conversion);
	
		if (!allSurveys.success) {
			return { status: 500, message: 'Error fetching surveys' };
		}

		const allowedLanguageIds = new Set([
			1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 19, 20, 21, 23, 26, 28, 29, 31, 32,
			35, 36, 37, 38, 39, 40, 42, 43, 44, 47, 49, 55, 56, 69, 74, 77, 87, 103, 110, 75, 111, 105, 98, 85, 45, 65, 72, 51, 50, 155, 92, 241
		]);
		const surveys = allSurveys.surveys.filter(record => allowedLanguageIds.has(record.languageId) && !record.isPII);
	
		// const checkConversionUnimrkt = await Promise.all(surveys.map(async survey => {
		// 	try {
		// 		const checkUnimarktStat = await getSurveysDetails.getUnimarktStat(survey.surveyId);
		// 		const conversion = checkUnimarktStat.globalStats.conversion;	
		// 		return conversion > conversionRate ? survey : null;
		// 	} catch (error) {
		// 		return null;
		// 	}
		// }));
		const checkConversionUnimrkt = surveys;
		const validSurveys = checkConversionUnimrkt.filter((survey) => survey !== null);
		const languageCodeMap = {
			1: "English-GB",
			2: "French-FR",
			3: "En-US",
			4: "English-AU",
			5: "English-CA",
			6: "English-IN",
			7: "German-DE",
			8: "Portuguese-BR",
			9: "French-CA",
			10: "Polish-PL",
			11: "English-IE",
			12: "Spanish-MX",
			13: "Spanish-US",
			15: "English-SG",
			16: "Dutch-NL",
			17: "Italian-IT",
			19: "English-ZA",
			20: "English-HK",
			21: "Danish-DK",
			23: "German-AT",
			26: "Chinese-CN",
			28: "French-CH",
			29: "German-CH",
			31: "Greece-Greek",
			32: "Norwegian-NO",
			33: "Spanish-CL",
			35: "Spanish-ES",
			36: "Swedish-SE",
			37: "Thai-TH",
			38: "Turkish-TR",
			39: "Spanish-CO",
			40: "Arabic-SA",
			42: "Malay-MY",
			43: "Chinese-HK",
			44: "Korean-KR",
			47: "Arabic-AE",
			49: "Spanish-AR",
			55: "English-NZ",
			56: "English-MY",
			69: "Spanish-PR",
			74: "Romanian-RO",
			77: "Hindi-IN",
			87: "Spanish-GT",
			103: "Spanish-EC",
			110: "Spanish-SV",
			75: "Arabic-EG",
			111: "Arabic-OM",
			105: "Arabic-QA",
			98: "Bulgaria-BG",
			85: "Croatian-HR",
			45: "English-PH",
			65: "Finnic-fi",
			72: "Hungarian-HU",
			51: "Indonesian-ID",
			50: "Mandarin-TW",
			155: "Serbian-RS",
			92: "Slovene-SI",
			241: "Spanish-PA"
		};
	
		const groupedByLanguageId = validSurveys.reduce((acc, obj) => {
			const { languageId } = obj;
			const langCode = languageCodeMap[languageId] || "Other";
	
			if (!acc[langCode]) {
				acc[langCode] = [];
			}
	
			acc[langCode].push(obj);
			return acc;
		}, {});
		   
		const allSurveysToUpsert = await getSurveyUpSertData(validSurveys);
		const processedSurveys = await processSurveys(groupedByLanguageId, allSurveysToUpsert);
	
		
		return { status: 200, message: 'Data processed successfully', processedSurveys };
	} catch (error) {
		console.error('Error:', error);
		return { status: 400, message: 'Oops, something went wrong', error };
	}
}


async function getSurveyUpSertData(surveys) {

	var allSurveysToUpsert = [];
	for (key in surveys) {
		
		const keyDataObject = surveys[key];
		if(keyDataObject.ir > 10 && keyDataObject.loi <= 30 ){
		const surveyId = `UMT${keyDataObject.surveyId}`;
		const IsMobileAllowed = keyDataObject.mobile || keyDataObject.tablet;
		const IsNonMobileAllowed = keyDataObject.deskTop;
		let device = "Both"
		if (IsMobileAllowed && IsNonMobileAllowed) {
			device = "Both"
		} else if (IsMobileAllowed) {
			device = "Mobile Only"
		} else if (IsNonMobileAllowed) {
			device = "Non-Mobile Only"
		} else {
			device = "NA"
		}

		let langCode = "En-US";
		 const languageMap = {
			1: "English-GB",
			2: "French-FR",
			3: "En-US",
			4: "English-AU",
			5: "English-CA",
			6: "English-IN",
			7: "German-DE",
			8: "Portuguese-BR",
			9: "French-CA",
			10: "Polish-PL",
			11: "English-IE",
			12: "Spanish-MX",
			13: "Spanish-US",
			15: "English-SG",
			16: "Dutch-NL",
			17: "Italian-IT",
			19: "English-ZA",
			20: "English-HK",
			21: "Danish-DK",
			23: "German-AT",
			26: "Chinese-CN",
			28: "French-CH",
			29: "German-CH",
			31: "Greece-Greek",
			32: "Norwegian-NO",
			33: "Spanish-CL",
			35: "Spanish-ES",
			36: "Swedish-SE",
			37: "Thai-TH",
			38: "Turkish-TR",
			39: "Spanish-CO",
			40: "Arabic-SA",
			42: "Malay-MY",
			43: "Chinese-HK",
			44: "Korean-KR",
			47: "Arabic-AE",
			49: "Spanish-AR",
			55: "English-NZ",
			56: "English-MY",
			69: "Spanish-PR",
			74: "Romanian-RO",
			77: "Hindi-IN",
			87: "Spanish-GT",
			103: "Spanish-EC",
			110: "Spanish-SV",
			75: "Arabic-EG",
			111: "Arabic-OM",
			105: "Arabic-QA",
			98: "Bulgaria-BG",
			85: "Croatian-HR",
			45: "English-PH",
			65: "Finnic-fi",
			72: "Hungarian-HU",
			51: "Indonesian-ID",
			50: "Mandarin-TW",
			155: "Serbian-RS",
			92: "Slovene-SI",
			241: "Spanish-PA"
		};
		langCode = languageMap[keyDataObject.languageId] || "Other";
		let StudyTypes = "ADHOC";
		let cpi = parseFloat(keyDataObject.cpi).toFixed(2);
		let projectStatus = 'Live';
		// let EPC = parseInt(keyDataObject.incidence_rate * cpi);
		let totalRemaining = keyDataObject.remaining
		// let guid = keyDataObject.SurveyGuId !== undefined ? keyDataObject.SurveyGuId : 0;
		const dataObj = [
			surveyId, surveyId, surveyId, totalRemaining,
			keyDataObject.entryLink, '',
			cpi, projectStatus, keyDataObject.loi, keyDataObject.ir,
			1, 1, langCode, appConstants.Unimrkt_SURVEY_TYPE_ID, keyDataObject.surveyId, new Date().getTime(), device, 1, 'EPC', keyDataObject.surveyGroup ? '1' : '0', "", 1, keyDataObject.isPII ? '1' : '0', 
			langCode,StudyTypes,0,keyDataObject.buyerId,4
		];

		allSurveysToUpsert.push(dataObj);
		}
	}
	return allSurveysToUpsert;
}

async function processSurveys(groupedByLanguageId, allSurveysToUpsert) {
	try {
		const allSurveyIds = [...new Set(allSurveysToUpsert.map(x => x[14]))];
		const allDbSurveys = await getDbSurveys.getAllApiSurveyFromDbStudies("", appConstants.Unimrkt_SURVEY_TYPE_ID);
		const surveysToPause = difference(allDbSurveys, allSurveyIds);

		if (surveysToPause.length > 0) {
			await mrktDao.surveysToPause(surveysToPause, appConstants.Unimrkt_SURVEY_TYPE_ID)
		}
		
    for (const langCode in groupedByLanguageId) {      
			const [desiredQualification, allQualifications, allOptions] = await Promise.all([
				existingMappings(langCode),
				getAllQualificationFromDb(langCode),
				getAllOptionsFromDb(langCode),
			]);

		

		async function processInBatches(items, batchSize) {
			const results = [];

			for (let i = 0; i < items.length; i += batchSize) {
				const batch = items.slice(i, i + batchSize).map(survey =>
					getSurveysDetails.getScreenerInfo(survey.surveyId)
				);

				const batchResults = await Promise.allSettled(batch);
				results.push(...batchResults);

				// Optional: add delay to reduce load
				
			}

			return results;
		}

		// Usage:
		const settledResults = await processInBatches(groupedByLanguageId[langCode], 10); // 5 at a time
		const qualificationSurveys = settledResults
			.filter(result => result.status === "fulfilled")
			.map(result => result.value);
		const surveysToInsert = await mappSurveys(qualificationSurveys, desiredQualification);
		const surveyIdsToUpsert = Array.isArray(surveysToInsert[1]) ? surveysToInsert[1] : [];
		const [matchedSurveys, surveyIds, unMatchedSurveysIds, unMatchQualification] = surveysToInsert;
		if (unMatchedSurveysIds && unMatchedSurveysIds.length) {
			await upsertIntoUnmappedqualification(unMatchedSurveysIds, unMatchQualification, langCode);
		}
		const matchedFilterSurveys = allSurveysToUpsert.filter(item => surveyIdsToUpsert.includes(item[14]));

			const quotaPromises = surveyIdsToUpsert.map(async (survey) => {
				return getSurveysDetails.getQuotaInfo(survey);
			});				
		async function runInBatches(promises, batchSize = 10) {
			const results = [];

			for (let i = 0; i < promises.length; i += batchSize) {
				const batch = promises.slice(i, i + batchSize);
				const settled = await Promise.allSettled(batch);
				results.push(...settled);
			}

			return results;
		}
		const quotaSurveyResult = await runInBatches(quotaPromises, 10);

		const quotaSurvey = quotaSurveyResult
			.filter(result => result.status === "fulfilled")
			.map(result => result.value);

			if (matchedFilterSurveys.length) {
				await upsertStudiesData(matchedFilterSurveys);
				// matchedFilterSurveys.map(survey => mrktDaoMapping.vendorMapping(survey));
			}
			
			const quotaSurveysAddComplete = groupedByLanguageId[langCode].map(async (survey) => {
				const matchingSurvey = quotaSurvey.filter(item => item.surveyId === survey.surveyId);
					if (matchingSurvey.length) {
							// Update quotas with remaining value from groupedByLanguageId
					matchingSurvey.forEach(quotaItem => {
						quotaItem.total_remaining = survey.remaining;
					});
					}
					return matchingSurvey; 
			});
							
			const quotaSurveys = (await Promise.all(quotaSurveysAddComplete)).flat();
				// Process survey qualifications and quotas in here
			await Promise.all([
				unimarketQualification(surveysToInsert[0], allQualifications, allOptions, langCode),
				unimarketQuota(quotaSurveys, allQualifications, allOptions, langCode),
			]);      
			
      
    }
	return true;
  } catch (error) {
    console.error("Error:", error);
  }
}

module.exports = {insertUnimrktSurveysInDb}
