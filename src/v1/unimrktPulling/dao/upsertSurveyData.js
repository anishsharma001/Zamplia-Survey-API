const questionTypes = require('./getQuestionType')
const saveRecord = require('../../common/insertRecords');

async function upsertSurveyScreener(surveyId, surveyScreener, langCode) {
  return new Promise(async (resolve, reject) => {
    let date = new Date();
    let upsertSurveyScreener = []
    for (let mm = 0; mm < surveyScreener.length; mm++) {
      let questionType = questionTypes.filter(q =>
        q.id == surveyScreener[mm].typeId
      )
      let optionsId = ''
      if(surveyScreener[mm].questionId == 1001){
        optionsId = surveyScreener[mm].options.map(o => o);
        if (optionsId.length > 1) {
          optionsId = optionsId.join(',');
        } else {
          optionsId = optionsId.join('-')
        }
      } else {
        optionsId = surveyScreener[mm].options.map(o => o)
        optionsId = optionsId.join('-')
      }
      upsertSurveyScreener.push([
        'UMT'+surveyId + surveyScreener[mm].questionId,
        surveyScreener[mm].questionId,
        surveyScreener[mm].typeId,
        questionType[0].name,
        optionsId,
        surveyId,
        langCode
      ])
    }
    if (upsertSurveyScreener.length > 0) {
      var queryDemo = `insert into unimrktsurveyqualification(sqId, questionId, typeId, questionTypeName, optionsId, surveyId, langCode) values ? ON 
          DUPLICATE KEY UPDATE questionId=values(questionId), questionTypeName=values(questionTypeName), typeId=values(typeId),  optionsId=values(optionsId),langCode=values(langCode)`;
     await saveRecord.insertRecord(queryDemo, upsertSurveyScreener);
    }
    resolve(true)
  })
}

async function upsertSurveyQuota(surveyId, SurveyQuota, langCode) {
  return new Promise(async (resolve, reject) => {
    let quotaRows = []
    let quotaQualificationsRows = []

    let surveyQuota = SurveyQuota;
    for (let index in surveyQuota) {
      let qual = surveyQuota[index].conditions;
      for (let key in qual) {
        let questionType = questionTypes.filter(q =>
          q.id == qual[key].typeId
        )
        quotaRows.push([
          'UMT'+surveyId + surveyQuota[index].quotaId,
          qual[key].questionId,
          qual[key].typeId,
          questionType[0].name,
          surveyId,
          langCode,
          surveyQuota[index].quotaId,
          surveyQuota[index].remaining
        ])
        let qualOption = qual[key].options;
        for (let i = 0; i < qualOption.length; i++) {
          if (qualOption.length > 0) {
            quotaQualificationsRows.push([
              'UMT'+ surveyId + surveyQuota[index].quotaId + qualOption[i].replace("-", "").substring(0, 4),
              qual[key].questionId,
              qual[key].typeId,
              questionType[0].name,
              surveyId,
              langCode,
              surveyQuota[index].quotaId,
              surveyQuota[index].remaining,
              qualOption[i],
            ]);
          }
        }
      }
    }

    let quotaQuery = `INSERT INTO unimrktsurveyquota (sqId, questionId, typeId, questionTypeName, surveyId, langCode, quotaId, remaining ) values ? 
      ON DUPLICATE KEY UPDATE questionId=values(questionId), typeId=values(typeId), questionTypeName=values(questionTypeName), 
      langCode=values(langCode), quotaId=values(quotaId), remaining=values(remaining) `
    let quotaQualificationsQuery = `INSERT INTO unimrktsurveyquotaqualifications (sqoId, questionId, typeId, questionTypeName, surveyId, langCode, quotaId, remaining, optionIds ) values ?
            ON DUPLICATE KEY UPDATE questionId=values(questionId), typeId=values(typeId), questionTypeName=values(questionTypeName), 
            langCode=values(langCode), quotaId=values(quotaId), remaining=values(remaining) ,
            optionIds=values(optionIds) 
          `

    if (quotaRows.length > 0) {
       await saveRecord.insertRecord(quotaQuery, quotaRows)
    }
    if (quotaQualificationsRows.length > 0) {
      await saveRecord.insertRecord(quotaQualificationsQuery, quotaQualificationsRows)
    }
    resolve(true)
  })
}

async function upsertSurveyGroup(surveyId, SurveyQuota, langCode) {
  return new Promise((resolve, reject) => {
    let groupData = [];
    for (const groupSur in SurveyQuota) {
      let allGroupSurveys = SurveyQuota[groupSur].groupSurveys.map(o =>
        'UMT' + o
      )
      allGroupSurveys = allGroupSurveys.join('-')
      groupData.push([
        'UMT'+ surveyId + SurveyQuota[groupSur].groupId,
        surveyId,
        SurveyQuota[groupSur].groupId,
        allGroupSurveys,
        langCode
      ])
    }
    let groupQuery = `INSERT INTO unimrktsurveygroups (sgId, surveyId, groupId, allGroupSurveys, langCode) values ? 
      ON DUPLICATE KEY UPDATE groupId=values(groupId), allGroupSurveys=values(allGroupSurveys),langCode=values(langCode) `;
    saveRecord.insertRecord(groupQuery, groupData);
    resolve(true)
  })
}

module.exports = {
  upsertSurveyScreener,
  upsertSurveyQuota,
  upsertSurveyGroup
}
