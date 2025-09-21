async function getAllSurveyQuota(allSurveyIds) {
    return new Promise(function (resolve, reject) {
		const result = allSurveyIds.map(value => "'"+`INN${value}`+"'").join(",");
		const query = `select id as quotaId, studyId,lang_code, sqid, clientQuotaId from constrainsts where studyId in (${result})`;
		queryWrapper.execute(query, [], async function (responseData) {
			if (responseData.errno && responseData.errno !== undefined) {
				resolve([])
			} else {
				if (responseData.length > 0) {
					resolve(responseData);
				} else {
					resolve([])
				}
			}
		})
	})
}

module.exports = { getAllSurveyQuota }