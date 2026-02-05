const { execute } = require('../../database/queryWrapperMysql');
const axios = require('axios');


const apiKey = 'C9D1462F-42DC-46A6-B9C4-C883B7F8032E';

async function liveLucidDemandSurvey(req, res) {
    // First, get existing buyers with priority = -1
    try {
        let { lang_code, date } = req.body || req.query;
        if (!lang_code || !date) {
            return res.send({
                success: false,
                error: "lang_code and date are required"
            })
        }
        let allSurveys = await getLucidAllSurveys(lang_code, date);

        for (let index = 0; index < allSurveys.length; index++) {
            const element = allSurveys[index];
            let getSurveyData = await getLucidSurveys(element.surveySID);
            if (getSurveyData && getSurveyData.Survey && Object.keys(getSurveyData.Survey).length) {
                if (getSurveyData?.Survey && getSurveyData?.Survey?.SurveyStatusCode != "03") {
                    let data = getSurveyData?.Survey;
                    data.SurveyStatusCode = "03";
                    try {
                        const url = `https://api.samplicio.us/Demand/v1/Surveys/Update/${encodeURIComponent(data.SurveyNumber)}`;
                        let resp = await axios.put(url, data, {
                            headers: {
                                Authorization: apiKey,
                                'Content-Type': 'application/json'
                            },
                            timeout: 10000
                        });
                        console.log(resp);

                    } catch (err) {
                        console.error('updateLucidSurvey error:', err && err.message ? err.message : err);
                    }
                }
            }

        }

        return res.send({
            success: true,
        })

    } catch (error) {
        return res.send({
            success: false,
            error: error.message
        })
    }
}

async function getLucidAllSurveys(lang_code, date) {
    let langQuery = `AND s.lang_code = '${lang_code}'`
    let dateQuery = `AND p.createdAt >= '${date}'`
    let query = `SELECT l.surveySID
                FROM participants p 
                LEFT JOIN studies s ON p.sid = s._id
                left join lucidmappingtostudies as l on l.studyId = s._id
                WHERE s.apitype IN (1)
                AND p.tid = '7202011VENDOR1607321927050'
                    AND p.status = 1
                    ${lang_code ? langQuery : ''}
                    ${date ? dateQuery : ''}
                GROUP BY 
                    s._id
                HAVING 
                    COUNT(p.p_id) > 1
                    ORDER BY COUNT(p.p_id) DESC;`;
    let result = await execute(query);
    return result;
}


async function getLucidSurveys(surveyId) {
    try {
        const url = `https://api.samplicio.us/Demand/v1/Surveys/BySurveyNumber/${encodeURIComponent(surveyId)}`;
        const { data } = await axios.get(url, {
            headers: { Authorization: apiKey },
            timeout: 10000
        });
        return data;
    } catch (error) {
        console.error('getLucidSurveys error:', error && error.message ? error.message : error);
        return null;
    }
}



module.exports = {
    liveLucidDemandSurvey
};