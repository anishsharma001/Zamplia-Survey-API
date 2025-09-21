const request = require('request');

async function syncStudiesOnVendor(surveyIds) {
    return new Promise(function (resolve, reject) {
        const body = {
            "studyId": surveyIds
        }
        let url = "http://localhost:8080/api/syncStudiesOnVendor";
        // url =  "https://zampliabackend.azurewebsites.net/api/syncStudiesOnVendor";
        let headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        request.post({ url: url, body: JSON.stringify(body), headers: headers }, function (e, r, body) {
            resolve(body);
        });
    });
}

module.exports = {
    syncStudiesOnVendor: syncStudiesOnVendor
}