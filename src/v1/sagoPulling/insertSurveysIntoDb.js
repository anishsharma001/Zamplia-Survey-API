const request = require('request');
const getSurveys = require('./getMCQSurveysFromServer');
const {difference} = require('lodash');
const appConstants = require('../sagoPulling/appConstants');
// const log4js = require('../common/logger');
// const logger = log4js.getLogger('MQube-insertSurveysIntoDb');
// const Mapping = require('../participants/refactor/dao/Mapping');
// const Study = require('../participants/refactor/dao/Study');
// const Vendor = require('../participants/refactor/dao/Vendor');
// const meta = require('../config/meta.json');


const { getAllQualificationFromDb, getAllOptionsFromDb, getAllLangCodeForMcq, upsertIntoStudies, updateAllSurveyStatus,getAllApiSurveyFromDbStudies } = require('./comman');
const McQSurveyQualification = require('./McqSurveyQualification')
const { MCQSurveyQuota } = require('./mcqSurveyQuota')
const { createGroupSurveys } = require('./insertGroupSecurity')
// const redis = require('../middlewares/redisClient');

async function insertSurveysIntoDb(req, res) {
	try {

		let responseData = {};
		let conversionRate = 5;
		const allSurveys = await getSurveys.getMCQSurveysFromServer();
		if (allSurveys.success === true) {

			let surveys = allSurveys.surveys.filter(function (record) {
				return record.TotalRemaining > 7 && record.IR >= 10 && record.CollectPII === false
					&& record.LOI <= 30
			});

			const getAllBuyerIds = await getSurveys.getMCQBuyerIdFromServer()
			if (getAllBuyerIds.success === true) {
				surveys = surveys.map(obj1 => {
					const matchingBuyer = getAllBuyerIds.surveys.find(obj2 => obj2.SurveyId === obj1.SurveyId);
					if (matchingBuyer) {
						obj1.BuyerId = matchingBuyer.BuyerId;
					} else {
						obj1.BuyerId = "";
					}
					if (matchingBuyer && [44478].includes(matchingBuyer.BuyerId)) {
						return null;
					}
					return obj1;
				});
			}
			surveys = surveys.filter(survey => survey !== null);

			const checkConversionSago = await Promise.all(surveys.map(async survey => {
				try {
					const checkSagoStat = await getSurveys.getMCQSurveyStatsFromServer(survey.SurveyId);
					if (checkSagoStat.success) {
						const conversion = checkSagoStat.surveys.Conversion;
						return checkSagoStat.surveys.Entrants > 20 ? (conversion >= 3 ? survey : null) : survey;
					} else {
						return survey;
					}

				} catch (error) {
					return null;
				}
			}));
			surveys = checkConversionSago.filter((survey) => survey !== null);
			// surveys = surveys.filter(function (record) {

			// 	if(record.IR < 90){
			// 		record.IR = Math.floor(Math.random() * (100 - 90 + 1) + 90);
			// 	}

			// 	if(record.LOI > 10 && record.LOI <= 20){
			// 		record.LOI = Math.floor(Math.random() * (10 - 5 + 1) + 5);
			// 	}

			// 	return record.CPI >= 1;
			// });



			//&& record.Recommended == true

			const allSurveysToUpsert = getSurveyUpSertData(surveys);
			const allSurveyIds = [...new Set(allSurveysToUpsert.map(x => x[14]))];
			const allDbSurveys = await getAllApiSurveyFromDbStudies("", appConstants.MCQ_SURVEY_TYPE_ID);
			let surveysToPause = difference(allDbSurveys, allSurveyIds);
			await upsertIntoStudies(allSurveysToUpsert);


			if (surveysToPause.length > 0) {

				let mappedStudyList = surveysToPause.map(x => 'MCQ' + x);
				updateAllSurveyStatus(surveysToPause, appConstants.MCQ_SURVEY_TYPE_ID);

				//remove cache onhold studies
				// for (let c = 0; c < mappedStudyList.length; c++) {
				// 	redis.removeOne(`study~sid_${mappedStudyList[c]}`);
				// }

				//LUCID
				// let query = "select studyId,surveySID from lucidmappingtostudies where isActive=1  and  studyId in ( ? )";
				// let studyList = await saveRecord.insertRecord(query, mappedStudyList);
				// if (studyList[0].result) {
				// 	for (let index in studyList[0].studyData) {
				// 		let query = {};
				// 		query.surveyId = studyList[0].studyData[index].surveySID;
				// 		query.status = "04";
				// 		query.precisionSurveyId = studyList[0].studyData[index].studyId;
				// 		let req = {};
				// 		req.query = query;
				// 		updateLucidStudies.updateLucidStudies(req);
				// 	}
				// }

				// Pure spectrum
				// let pureQuery = "select sid,surveyId from purespectrummappingtostudies where sid in ( ? ) and surveyStatus= 'Live' ";
				// let pureStudyList = await saveRecord.insertRecord(pureQuery, mappedStudyList);
				// if (pureStudyList[0].result) {
				// 	for (let index in pureStudyList[0].studyData) {
				// 		let surveyId ="";
				// 		surveyId = pureStudyList[0].studyData[index].surveyId;
				// 		let status = "33";
				// 		updatePureStudies(surveyId,status)
				// 	}
				// }

				//DISQO
				// let query2 = "select studyId,disqoId from disqmappingtostudies where studyId in ( ? )  and disqoEligible=1 and isActive=1";
				// let disqoMapping = await saveRecord.insertRecord(query2, mappedStudyList);
				// if (disqoMapping[0].result) {
				// 	for (let index in disqoMapping[0].studyData) {
				// 		await updateDisqoStudies.updateSurveyStatusDisqo(disqoMapping[0].studyData[index].disqoId, "COMPLETED");
				// 	}
				// }

				//PRODEGE
				// let query3 = 'SELECT prodgeId FROM prodgemappingtostudies where isActive=1 and prodgeId >1 and studyId in ( ? )';
				// let prodgeMapping = await saveRecord.insertRecord(query3, mappedStudyList);
				// var date = new Date();
				// var time = date.getTime();
				// const baseUrl = "http://www.swagbucks.com/prodegemr";
				// const apik = "FARYBmDpWEXHztw";

				// if (prodgeMapping[0].result) {
				// 	for (let index in prodgeMapping[0].studyData) {
				// 		var projectUpdate = {
				// 			'method': 'POST',
				// 			'url': baseUrl + '/project-update',
				// 			'headers': {
				// 				'Content-Type': 'application/x-www-form-urlencoded',
				// 			},
				// 			form: {
				// 				'apik': apik,
				// 				'request_date': time,
				// 				'signature': '{signature}',
				// 				'prodege_project_id': prodgeMapping[0].studyData[index].prodgeId,
				// 				'status': 'COMPLETE'
				// 			}
				// 		};
				// 		projectUpdate = await pordeSignature.signRequest(projectUpdate);
				// 		request(projectUpdate, function (error, response) {});
				// 	}
				// }

				//Go Branded
				// let query4 = `SELECT surveyId FROM gobrandedmappingstostudies where surveyStatus='Live' and surveyId > 0 and sid in ( ? )`;
				// let goMapping = await saveRecord.insertRecord(query4, mappedStudyList);
				// let goSurveyIds = [];
				// if (goMapping[0].result) {
				// 	for (let index in goMapping[0].studyData) {
				// 		goSurveyIds.push(goMapping[0].studyData[index].surveyId);
				// 	}
				// }
				// if(goSurveyIds.length > 0){
				// 	goBrandedService.closeStudiesOnGobranded(goSurveyIds);
				// }

				// precision pause here
				// let studyToPauseOnPrecision = await PTwoDao.getStudiesFromMappingsPrecision(mappedStudyList);
				// PTwoDao.updateStatusMappingForPrecision(mappedStudyList);
				// if(studyToPauseOnPrecision.length > 0){
				//     for (i in studyToPauseOnPrecision) {
				//         let surveySID = studyToPauseOnPrecision[i].surveySID;
				//         prService.updateProjectStatusClose({ProjectId : surveySID});
				//     }
				// }

				//Tap Research
				// let query5 = `SELECT surveyId FROM tapresearchmappingstostudies where surveyStatus = "Live" and surveyId > 0 and sid in ( ? )`;
				// let tapMapping = await saveRecord.insertRecord(query5, mappedStudyList);
				// if (tapMapping[0].result) {
				// 	for (let index in tapMapping[0].studyData) {
				// 		await tapResearchService.updateSurvey({ "status": 5 }, tapMapping[0].studyData[index].surveyId);
				// 	}
				// }

				// let updateQuery = "update lucidmappingtostudies set isActive=0 where studyId in ( ? )";
				// let updateQueryDisqo = "update disqmappingtostudies set isActive=0 where studyId in ( ? )";
				// let updateQueryProdge = 'update prodgemappingtostudies set isActive=0 where isActive=1 and studyId in (?)';
				// let updateQueryGoBranded = `update gobrandedmappingstostudies set surveyStatus='On Hold' where surveyStatus='Live' and sid in (?)`;
				// let updateQueryTap = `update tapresearchmappingstostudies set surveyStatus='On Hold' where surveyStatus='Live' and sid in (?)`;

				// saveRecord.insertRecord(updateQuery, mappedStudyList);
				// await saveRecord.insertRecord(updateQueryDisqo, mappedStudyList);
				// saveRecord.insertRecord(updateQueryProdge, mappedStudyList);
				// saveRecord.insertRecord(updateQueryGoBranded, mappedStudyList);
				// await saveRecord.insertRecord(updateQueryTap, mappedStudyList);
			}


			// let poId = await getPO.getClientPoData();
			// let masterOptionQuery = 'select qualificationId,answerIds,answerCodes,studyId from mcqsurveyqualifications where studyId in ( ? ) ';
			// let studyIDList = allSurveysToUpsert.map(x => x[0].substring(3, x[0].length));
			// let masterQualification = await saveRecord.insertRecord(masterOptionQuery, studyIDList);

			// for (let survey in allSurveysToUpsert) {

			// 	//remove cache live studies
			// 	// redis.removeOne(`study~sid_${allSurveysToUpsert[survey][0]}`);

			// 	//Lucid
			// req.body = new mappingStudy(allSurveysToUpsert[survey], '7202011VENDOR1607321927050');
			// if (req.body !== undefined) {
			// 	let poData = poId.filter(data => data.vendorId == req.body.thirdPartyId);
			// 	let poNewID = "";
			// 	if (poData.length > 0) {
			// 		poNewID = poData[0].PO;
			// 	}
			// 	new mapVendor(req, poNewID, function (data) { });
			// }

			// 	//Prodege
			// 	// let req3 = {};
			// 	// req3.body = new mappingStudy(allSurveysToUpsert[survey], '7202011VENDOR1607322159095');
			// 	// req3.quotas = [];
			// 	// if (req3.body !== undefined) {
			// 	// 	let poData = poId.filter(data => data.vendorId == req3.body.thirdPartyId);
			// 	// 	let poNewID = "";
			// 	// 	if (poData.length > 0) {
			// 	// 		poNewID = poData[0].PO;
			// 	// 	}
			// 	// 	new mapVendor(req3, poNewID, function (data) {});
			// 	// }

			// 	// //GO Branded
			// 	// let req5 = {};
			// 	// req5.body = new mappingStudy(allSurveysToUpsert[survey], '1220213VENDOR1618212456189');
			// 	// req5.quotas = [];
			// 	// if (req5.body !== undefined) {
			// 	// 	let poData = poId.filter(data => data.vendorId == req5.body.thirdPartyId);
			// 	// 	let poNewID = "";
			// 	// 	if (poData.length > 0) {
			// 	// 		poNewID = poData[0].PO;
			// 	// 	}
			// 	// 	new mapVendor(req5, poNewID, function (data) {});
			// 	// }

			// 	// //Precision
			// 	// let req6 = {};
			// 	// req6.body = new mappingStudy(allSurveysToUpsert[survey], '2420214VENDOR1621878197342');
			// 	// req6.quotas = [];
			// 	// if (req6.body !== undefined) {
			// 	// 	let poData = poId.filter(data => data.vendorId == req6.body.thirdPartyId);
			// 	// 	let poNewID = "";
			// 	// 	if (poData.length > 0) {
			// 	// 		poNewID = poData[0].PO;
			// 	// 	}
			// 	// 	new mapVendor(req6, poNewID, function (data) {});
			// 	// }

			// 	// //Tap Research
			// 	// let req7 = {};
			// 	// req7.body = new mappingStudy(allSurveysToUpsert[survey], '1320213VENDOR1618298945509');
			// 	// req7.quotas = [];
			// 	// if (req7.body !== undefined) {
			// 	// 	let poData = poId.filter(data => data.vendorId == req7.body.thirdPartyId);
			// 	// 	let poNewID = "";
			// 	// 	if (poData.length > 0) {
			// 	// 		poNewID = poData[0].PO;
			// 	// 	}
			// 	// 	new mapVendor(req7, poNewID, function (data) {});
			// 	// }


			// 	//Loopsurveys
			// 	// let req8 = {};
			// 	// req8.body = new mappingStudy(allSurveysToUpsert[survey], '2820217VENDOR1630129708881');
			// 	// if (req8.body !== undefined) {
			// 	// 	let poData = poId.filter(data => data.vendorId == req8.body.thirdPartyId);
			// 	// 	let poNewID = "";
			// 	// 	if (poData.length > 0) {
			// 	// 		poNewID = poData[0].PO;
			// 	// 	}
			// 	// 	new mapVendor(req8, poNewID, function (data) {});
			// 	// }

			// 	//Zampliasurveys
			// 	// let req9 = {};
			// 	// req9.body = new mappingStudy(allSurveysToUpsert[survey], '1220228VENDOR1662983969646');
			// 	// if (req9.body !== undefined) {
			// 	// 	let poData = poId.filter(data => data.vendorId == req9.body.thirdPartyId);
			// 	// 	let poNewID = "";
			// 	// 	if (poData.length > 0) {
			// 	// 		poNewID = poData[0].PO;
			// 	// 	}
			// 	// 	new mapVendor(req9, poNewID, function (data) { });
			// 	// }

			// 	//Pure spectrum 
			// 	// let req10 = {};
			// 	// req10.body = new mappingStudy(allSurveysToUpsert[survey], '2420201VENDOR1582554920786');
			// 	// req10.quotas = [];
			// 	// if (req10.body !== undefined) {
			// 	// 	let poData = poId.filter(data => data.vendorId == req10.body.thirdPartyId);
			// 	// 	let poNewID = "";
			// 	// 	if (poData.length > 0) {
			// 	// 		poNewID = poData[0].PO;
			// 	// 	}
			// 	// 	new mapVendor(req10, poNewID, function (data) {});
			// 	// }
			// // };

			// // for (let index1 in surveys) {
			// // 	let surveyId = surveys[index1].SurveyId
			// // 	let IsSurveyGroupExist = surveys[index1].IsSurveyGroupExist
			// // 	if (IsSurveyGroupExist && IsSurveyGroupExist === true) {
			// // 		let url = "https://api.sample-cube.com/api/Survey/GetSurveyGroups/1129/ed9044a5-ef26-4a3d-a6db-5d2d39e10b4e/"
			// // 		inserGroupSecurity.getGroupsFromServer(url, surveyId);
			// // 	}
			// }

			const languageSet = new Set();

			surveys.forEach(survey => {
				if (survey.zampLanguage) {
					languageSet.add(survey.zampLanguage);
				}
			});

			const LanguageCodes = [...languageSet];
			

			for (let i = 0; i < LanguageCodes.length; i++) {

				const LanguageWiseSurveys = surveys.filter(d=>d.zampLanguage === LanguageCodes[i]);
				const [allQualifications, allOptions, allLangCode] = await Promise.all([
					getAllQualificationFromDb(LanguageCodes[i]),
					getAllOptionsFromDb(LanguageCodes[i]),
					getAllLangCodeForMcq(),
				]);


				// Process survey qualifications and quotas
				let McqSurveyQualification = new McQSurveyQualification()
				await McqSurveyQualification.McQSurveyQualifications(LanguageWiseSurveys, allQualifications, allOptions, allLangCode);
				await MCQSurveyQuota(LanguageWiseSurveys, allQualifications, allOptions, allLangCode);
			}
			


			

			if (surveys.length) {
				const allSurveysData = allSurveysToUpsert.filter((d) => d[19] === 1);
				createGroupSurveys(allSurveysData);
			}

			// for (let index in allSurveyIds) {
			// 	let surveyId = allSurveyIds[index]
			// 	let qData = {};
			// 	qData.langId = 3;
			// 	qData.surveyId = '';
			// 	let url = "http://api.sample-cube.com/api/Survey/GetSupplierSurveyQualifications/1129/ed9044a5-ef26-4a3d-a6db-5d2d39e10b4e/"
			// 	getDemoFromServer.getDemoFromServer(url, surveyId, masterQualification[0].studyData, poId);

			// url = "https://api.sample-cube.com/api/Survey/GetSupplierSurveyQuotas/1129/ed9044a5-ef26-4a3d-a6db-5d2d39e10b4e/"
			// getDemoFromServer.getDemoFromServer(url, surveyId, masterQualification[0].studyData, poId);
			// }


			responseData.success = true;
			responseData.message = "Surveys created successfully!";
			return responseData;
		} else {
			responseData.success = false;
			responseData.message = "There is no survey found.";
			return responseData;
		}

	} catch (error) {
		console.log(error)
	}
}

function mappingStudy(survey, vendorId) {
	this.studyId = survey[0];
	this.thirdPartyId = vendorId;
	this.studyUrl = survey[4];
	this.testUrl = survey[5];
	this.requirement = 100;
	this.vendorCpi = parseFloat(survey[6]) * .6;
}

// function mapVendor(req, poNewID, resolve) {

// 	let mapping = new Mapping(req.body.thirdPartyId, req.body.studyId);
// 	let studyId = req.body.studyId
// 	let quotas = req.quotas
// 	let vendorCpiToInsert = req.body.vendorCpi;

// 	mapping.getThirdParyAndStudyMapping(function (mappingData, msg) {
// 		if (msg === meta.sqlError) {
// 			// logger.error(`Error while reading mapping table`)
// 			let rPromiseData = {};
// 			rPromiseData.success = false;
// 			rPromiseData.error = mappingData;
// 			rPromiseData.message = "Error While getting mapping of merchant.";
// 			resolve(rPromiseData);
// 		} else if (mappingData.length > 0) {
// 			let rPromiseData = {};
// 			rPromiseData.success = false;
// 			rPromiseData.message = "This merchant is already mapped with this project.";
// 			resolve(rPromiseData);
// 		} else {

// 			let vendor = new Vendor(req.body.thirdPartyId);
// 			vendor.getVendorById(function (thirdPartyData, msg) {
// 				if (msg === meta.sqlError) {
// 					// logger.error(`Error while reading vendor table`)
// 					let rPromiseData = {};
// 					rPromiseData.success = false;
// 					rPromiseData.error = thirdPartyData;
// 					rPromiseData.message = "Error While Creating Third Party Mapping";
// 					resolve(rPromiseData);
// 				} else if (thirdPartyData.length > 0) {

// 					let d = new Date();
// 					let timeNow = d.getTime();
// 					let dateNow = d.getDate();
// 					let month = d.getMonth();
// 					let yearNow = d.getFullYear();
// 					let newID = "" + dateNow + yearNow + month + "Map" + timeNow;
// 					let column = ' _id, studyId, thirdPartyId, successUrl, 	terminateUrl, overQuotaUrl, securityTerminate, studyUrl, studyTestUrl, createdAt, updatedAt, requirement, totalQuota, vendorCpi, po';
// 					let queryInsertion = "INSERT INTO mappings (" + column + ") VALUES ?";
// 					let addedVariables = "";
// 					if (thirdPartyData[0].variable1 === "") { } else {
// 						addedVariables = thirdPartyData[0].variable1 + "=XXXXXXXX";
// 						if (thirdPartyData[0].variable2 === "") { } else {
// 							addedVariables = addedVariables + "&" + thirdPartyData[0].variable2 + "=XXXXXXXX";
// 							if (thirdPartyData[0].variable3 === "") { } else {
// 								addedVariables = addedVariables + "&" + thirdPartyData[0].variable3 + "=XXXXXXXX";
// 							}
// 						}
// 					}

// 					let query = "";
// 					if (req.body.apiType === "MCQ") {
// 						query = "SELECT TotalRemaining as orignalRequirment FROM auto_studies  WHERE StudyExchId = '" + req.body.studyId + "'";
// 					} else {
// 						query = "SELECT orignalRequirment FROM studies  WHERE _id = '" + studyId + "'";
// 					}

// 					let study = new Study(studyId);
// 					study.getStudyById(function (study, msg) {
// 						if (msg === meta.sqlError) {
// 							let rPromiseData = {};
// 							rPromiseData.success = true;
// 							rPromiseData.error = study;
// 							resolve(rPromiseData);
// 						} else {

// 							let totalQuota = study[0].orignalRequirment * req.body.requirement / 100;
// 							let query = "Select * from mappings where studyId ='" + req.body.studyId + "'";
// 							queryWrapper.execute(query, [], function (mapping) {
// 								if (mapping.errno && mapping.errno !== undefined) {
// 									let rPromiseData = {};
// 									rPromiseData.success = true;
// 									rPromiseData.error = mapping;
// 									resolve(rPromiseData);
// 								} else {

// 									let q = ""
// 									if (studyId.includes('MCQ') && quotas !== undefined) {
// 										q = `[` + quotas.map(x => `"${x}"`) + `]`
// 									}
// 									let vendorSuccessUrl = rplaceQuotaId(thirdPartyData[0].redirectUrlSuccess, q !== "" ? q : studyId);
// 									let vendorTerminateUrl = rplaceQuotaId(thirdPartyData[0].redirectUrlTerminated, q !== "" ? q : studyId);
// 									let vendorOverQuotaUrl = rplaceQuotaId(thirdPartyData[0].redirectUrlOverQuota, q !== "" ? q : studyId);
// 									let vendorSecurityUrl = rplaceQuotaId(thirdPartyData[0].redirectUrlSecurityTermination, q !== "" ? q : studyId);

// 									if (mapping.length > 0) {

// 										let acquiredQuota = 0;
// 										for (let i = 0; i < mapping.length; i++) {
// 											acquiredQuota = acquiredQuota + mapping[i].requirement;
// 										}

// 										if (acquiredQuota + parseInt(req.body.requirement) > 1000000000) {
// 											let rPromiseData = {};
// 											rPromiseData.success = false;
// 											// logger.info("Total quota on this project is exceeding. Please enter correct requirement that fits into your project.")
// 											rPromiseData.message = "Total quota on this project is exceeding. Please enter correct requirement that fits into your project.";
// 											resolve(rPromiseData);
// 										} else {

// 											let mapping = new Mapping(req.body.thirdPartyId, studyId);
// 											queryWrapper.execute(queryInsertion, [[[newID, studyId, req.body.thirdPartyId, vendorSuccessUrl, vendorTerminateUrl,
// 												vendorOverQuotaUrl, vendorSecurityUrl, req.body.studyUrl, req.body.testUrl, d, d, req.body.requirement, totalQuota, vendorCpiToInsert, poNewID]]], function (saveMapping) {
// 													if (saveMapping.errno && saveMapping.errno !== undefined) {
// 														let rPromiseData = {};
// 														rPromiseData.success = false;
// 														rPromiseData.error = saveMapping;
// 														rPromiseData.message = "Error While Creating Third Party Mapping";
// 														resolve(rPromiseData);
// 													} else {
// 														mapping.getThirdParyAndStudyMapping(function (data, msg) { });
// 														let rPromiseData = {};
// 														rPromiseData.success = true;
// 														rPromiseData.message = "Merchant Mapping Is Successfull";
// 														resolve(rPromiseData);
// 													}
// 												});
// 										}

// 									} else {

// 										queryWrapper.execute(queryInsertion, [[[newID, studyId, req.body.thirdPartyId, vendorSuccessUrl, vendorTerminateUrl,
// 											vendorOverQuotaUrl, vendorSecurityUrl, req.body.studyUrl, req.body.testUrl, d, d, req.body.requirement, totalQuota, vendorCpiToInsert, poNewID]]], function (saveMapping) {
// 												if (saveMapping.errno && saveMapping.errno !== undefined) {
// 													let rPromiseData = {};
// 													rPromiseData.success = false;
// 													rPromiseData.error = saveMapping;
// 													rPromiseData.message = "Error While Creating Third Party Mapping";
// 													resolve(rPromiseData);
// 												} else {
// 													let rPromiseData = {};
// 													rPromiseData.success = true;
// 													rPromiseData.message = "Merchant Mapping Is Successfull";
// 													resolve(rPromiseData);
// 												}
// 											});
// 									}
// 								}
// 							}
// 							);
// 						}
// 					}
// 					);
// 				} else {
// 					let rPromiseData = {};
// 					rPromiseData.success = false;
// 					rPromiseData.message = "This merchant is not available.";
// 					resolve(rPromiseData);
// 				}
// 			});
// 		}
// 	});
// }

function rplaceQuotaId(url, quotaId) {
	return String(url).replace("<quotaId>", quotaId);
}

function getSurveyUpSertData(surveys) {

	let allSurveysToUpsert = [];
	for (key in surveys) {
		
		let keyDataObject = surveys[key];
		const allowedLangIds = new Set([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 19, 20, 21, 23, 26, 28, 29, 31, 32,
  35, 36, 37, 38, 39, 40, 42, 43, 44, 47, 49, 55, 56, 69, 74, 77, 87, 103, 110, 75, 111, 105, 98, 85, 45, 65, 72, 51, 50, 155, 92, 241
]);
            if (allowedLangIds.has(keyDataObject.LanguageId)) {
				let surveyId = `MCQ${keyDataObject.SurveyId}`;
			let IsMobileAllowed = keyDataObject.IsMobileAllowed;
			let IsNonMobileAllowed = keyDataObject.IsNonMobileAllowed;
			let IsTabletAllowed = keyDataObject.IsTabletAllowed;

			let device = "Both"
			if (IsMobileAllowed && IsNonMobileAllowed) {
				device = "Both"
			} else if (IsMobileAllowed) {
				device = "Mobile Only"
			} else if (IsNonMobileAllowed) {
				device = "Non-Mobile Only"
			}

			let isMobile = 0;
			let isTablet = 0;
			let isDesktop = 0;

			if (IsMobileAllowed) {
				isMobile = 1;
			}

			if (IsTabletAllowed) {
				isTablet = 1;
			}

			if (IsNonMobileAllowed) {
				isDesktop = 1;
			}

			let device_v2 = isMobile + "-" + isTablet + "-" + isDesktop;


			let langCode = "En-US"
			

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

			langCode = languageMap[keyDataObject.LanguageId] || "Other";
			let StudyTypes = "ADHOC";
			let EPC = parseInt(keyDataObject.IR * keyDataObject.CPI);
			let guid = keyDataObject.SurveyGuId !== undefined ? keyDataObject.SurveyGuId : 0

			let changeLoi = keyDataObject.LOI;
			if(keyDataObject.LOI >= 16 && keyDataObject.LOI <= 20){
				changeLoi = keyDataObject.LOI - 5;
			}else if(keyDataObject.LOI >= 21 && keyDataObject.LOI <= 25){
				changeLoi = keyDataObject.LOI - 10;
			}else if(keyDataObject.LOI >= 26 && keyDataObject.LOI <= 30){
				changeLoi = keyDataObject.LOI - 15;
			}

			const dataObj = [
				surveyId, keyDataObject.SurveyId, keyDataObject.SurveyId, keyDataObject.TotalRemaining, keyDataObject.LiveLink, keyDataObject.LiveLink,
				keyDataObject.CPI, "Live", changeLoi, keyDataObject.IR,
				1, 1, langCode, appConstants.MCQ_SURVEY_TYPE_ID, keyDataObject.SurveyId, new Date().getTime(), device, 1, EPC, keyDataObject.IsSurveyGroupExist ? 1 : 0, 
				guid, 1, device_v2, keyDataObject.CollectPII ? '1' : '0', keyDataObject.BuyerId, langCode,StudyTypes,0,4
			];
            surveys[key].zampLanguage  = langCode
			allSurveysToUpsert.push(dataObj);
		}
	}
	return allSurveysToUpsert;
}

function closeLucidProject(SID) {
	return new Promise(async function (resolve, reject) {
		let studyData = await getStudyById(SID);
		let surveyData = studyData.result[0];
		if (studyData.result.length > 0) {
			let isCreated = await checkTAAlreadyCreated(surveyData._id);
			if (isCreated.result.length > 0) {
				let surveySID = isCreated.result[0].surveySID;
				surveyData.surveySID = surveySID;
				let jsonBody = {
					status: "completes_approved"
				};
				UpdateSurveyInBetaVersionPatch(surveySID, jsonBody, surveyData._id);
			}
		}
	});
}

module.exports = {
	insertSurveysIntoDb: insertSurveysIntoDb
}
