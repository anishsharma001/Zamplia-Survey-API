const saveRecord = require('../../common/insertRecords');
const getAllSurveyQuotaFromDb = require('./getAllSurveyQuota');

async function upsertSurveyQuotaTargeting(surveyId, SurveyQuota, langCode, zampliaDemos, allSurveyIds) {
    return new Promise(async (resolve, reject) => {
        let date = new Date();
        let qualificationInsertData = [];
        let getAllSurveyQuota = await getAllSurveyQuotaFromDb.getAllSurveyQuota(allSurveyIds);
        //get all filter survey's quota
        if (getAllSurveyQuota && getAllSurveyQuota.length > 0) {
            const filteredSurveyQuota = SurveyQuota.map(obj1 => {
                const matchingObj = getAllSurveyQuota.find(obj2 => Number(obj2.clientQuotaId) === Number(obj1.id));
                if (matchingObj) {
                    return { ...obj1, quotaId: matchingObj.quotaId, studyId: matchingObj.studyId };
                }
            });
            if(filteredSurveyQuota.length > 0) {
                for (let index in filteredSurveyQuota) {
                    console.log(filteredSurveyQuota[index]);
                    let quotasTargeting = filteredSurveyQuota[index] && filteredSurveyQuota[index].hasOwnProperty('targeting') && filteredSurveyQuota[index].targeting;
                    if (quotasTargeting) {
                        for (const key in quotasTargeting) {
                            let quotasTargetingData = quotasTargeting[key];
                            if (key == 'AGE' || key == 'ZIPCODE') {
                                if (key == 'AGE') {
                                    for (let v = 0; v < quotasTargetingData.length; v++) {
                                        let ageFrom = quotasTargetingData[v].ageStart;
                                        let ageTo = quotasTargetingData[v].ageEnd;
                                        let demographicId = '1520196Demo1563257915329';
                                        let sqid = filteredSurveyQuota[index].quotaId
                                        let studyId = filteredSurveyQuota[index].studyId
                                        let quotaDemoId = sqid + "" + demographicId;
                                        let quotaStatus = filteredSurveyQuota[index].quotaStatus == 'Open' ? 1 : 0;
                                        qualificationInsertData.push([
                                            studyId,
                                            sqid,
                                            demographicId,
                                            quotaDemoId,
                                            String(ageFrom) + "," + String(ageTo),
                                            date,
                                            date
                                        ])
                                    }
                                } else {
                                    // zipcode
                                    const allText = quotasTargetingData.Options.map(option => option.OptionText).join(',');
                                    let demographicId = '620196Demo1562404395959';
                                    let sqid = filteredSurveyQuota[index].quotaId
                                    let studyId = filteredSurveyQuota[index].studyId
                                    let quotaDemoId = sqid + "" + demographicId;
                                    let quotaStatus = filteredSurveyQuota[index].quotaStatus == 'Open' ? 1 : 0;
                                    qualificationInsertData.push([
                                        studyId,
                                        sqid,
                                        demographicId,
                                        quotaDemoId,
                                        String(ageFrom) + "," + String(ageTo),
                                        date,
                                        date
                                    ])
                                }
                            } else {
                                // console.log(quotasTargetingData);
                                let filterQuota = zampliaDemos.option.filter(d => {
                                    return (d.innovateMrName == key && quotasTargetingData.some(target => target.OptionId === d.innovateOid));
                                }
                                )
                                // unique quota find according to queryoptionId
                                let uniqueQuota = filterQuota.reduce((result, obj) => {
                                    let existingObj = result.find(item => item.demographicId === obj.demographicId);
                                    if (existingObj) {
                                        existingObj.queryoptionId += `, ${obj.queryoptionId}`;
                                    } else {
                                        result.push({ ...obj });
                                    }
                                    return result;
                                }, []);
                                // console.log(filterQuota);
                                if (uniqueQuota.length > 0) {
                                    let demographicId = uniqueQuota[0].demographicId;
                                    let queryOptionId = uniqueQuota[0].queryoptionId;
                                    let sqid = filteredSurveyQuota[index].quotaId;
                                    let studyId = filteredSurveyQuota[index].studyId
                                    let quotaStatus = filteredSurveyQuota[index].quotaStatus == 'Open' ? 1 : 0;
                                    let quotaDemoId = sqid + "" + demographicId;
                                    qualificationInsertData.push([
                                        studyId,
                                        sqid,
                                        demographicId,
                                        quotaDemoId,
                                        String(queryOptionId),
                                        date,
                                        date
                                    ])
                                }
                            }
                        }
                    }
                }
            }
        }
        // console.log(qualificationInsertData);
        if (qualificationInsertData.length > 0) {
            let queryDemo = `insert into constrainstdemos(studyId, quotaId, demographicId, quotaDemoId, optionIds, 
                createdAt, updatedAt) values ? ON 
                DUPLICATE KEY UPDATE  quotaId = values(quotaId), demographicId = values(demographicId), optionIds=values(optionIds), updatedAt=values(updatedAt)`;
            await saveRecord.insertRecord(queryDemo, qualificationInsertData);
        }
    })
}

module.exports = { upsertSurveyQuotaTargeting }