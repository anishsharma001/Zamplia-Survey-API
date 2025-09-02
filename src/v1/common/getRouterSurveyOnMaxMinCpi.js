/**
 * getRouterSurveyOnMaxMinCpi will return the Router survey if available
 */
async function getRouterSurveyOnMaxMinCpi(maxCpi, minCpi, userCountryCode){
    let resultData = [];

    return new Promise(function(resolve, reject) {
            // Do async job
            var query = "";

            if(userCountryCode === ""){
                query = "select * from auto_studies As s \
                where s.CPI BETWEEN  "+minCpi+" AND "+maxCpi+" ORDER BY  Priority DESC  LIMIT 1";
            }else{
                query = "select * from auto_studies As s \
                where s.LanguageId = (SELECT LanguageId from auto_survey_language where CountryCode = '"+userCountryCode+"' LIMIT 1)  AND s.CPI BETWEEN  "+minCpi+" AND "+maxCpi+"  ORDER BY  Priority DESC  LIMIT 1";
            }
            queryWrapper.execute(query, [], function (result) {
            resultData.push(result[0]);
            resolve(resultData);
            });     
        });
}

module.exports= {
    getRouterSurveyOnMaxMinCpi : getRouterSurveyOnMaxMinCpi
}