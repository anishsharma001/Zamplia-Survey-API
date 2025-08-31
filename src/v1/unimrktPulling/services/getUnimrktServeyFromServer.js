const request = require('request');
const config = require('./config.js');
const axios = require('axios');
const upsertSurveyData = require('../dao/upsertSurveyData.js')

module.exports.getUnimrktServeyFromServer = async function () {
    return new Promise(async function (resolve, reject) {

        var options = {
            'method': 'GET',
            'url': `${config.UNIMRKT_BASE_URL}`,
            'headers': {
                'accept': 'application/json',
                'x-access-key': `${config.UNIMRKT_X_ACCESS_KEY}`,
            }
        };

        request(options, function (error, response, body) {
            let data = {};
            if (error) {
                data.success = false;
                resolve(data);
            } else {
                data.success = false;
                if (response.statusCode === 200) {
                    let res = JSON.parse(body);
                    data.success = true;
                    data.surveys = res.surveys;
                    resolve(data);
                } else {
                    resolve(data);
                }
            }
        });
    });
}

module.exports.getScreenerInfo = async function (id) {
    try {
        const options = {
            method: 'GET',
            url: `${config.UNIMRKT_BASE_URL}/${id}/questions`,
            headers: {
                'accept': 'application/json',
                'x-access-key': config.UNIMRKT_X_ACCESS_KEY,
            }
        };

        const response = await axios(options);
        if (response.status === 200) {
            return response.data;
        } else {
            return (`Request failed with status: ${response.status}`);
        }
    } catch (error) {
        return error;
    }
};

module.exports.getQuotaInfo = async function (id) {

    try {
        const options = {
            method: 'GET',
            url: `${config.UNIMRKT_BASE_URL}/${id}/quotas`,
            headers: {
                accept: 'application/json',
                'x-access-key': config.UNIMRKT_X_ACCESS_KEY,
            }
        };

        const response = await axios(options);
        if (response.status === 200) {
            const res = response.data;
            return response.data;
        } else {
            return (`Request failed with status: ${response.status}`);
        }
    } catch (error) {
        return error;
    }
};

module.exports.getGroupInfo = async function (id, langCode) {
    var options = {
        'method': 'GET',
        'url': `${config.UNIMRKT_BASE_URL}/${id}/groups`,
        'headers': {
            'accept': 'application/json',
            'x-access-key': `${config.UNIMRKT_X_ACCESS_KEY}`,
        }
    };

    request(options, function (error, response, body) {
        if (error) {
            return
        } else {
            if (response.statusCode === 200) {
                let res = JSON.parse(body);
                upsertSurveyData.upsertSurveyGroup(id, res.groups, langCode)
                return
            } else {
                return
            }
        }
    });
}

module.exports.getUnimarktStat = async function (surveyId){
    try{
        
        let configs = {
        method: 'GET',
        maxBodyLength: Infinity,
        url: `${config.UNIMRKT_BASE_URL}/${surveyId}/stats`,
        headers: { 
            'accept': 'application/json', 
            'x-access-key': `${config.UNIMRKT_X_ACCESS_KEY}`,
        }
        };
        
        const result = await axios.request(configs);
        return result.data;
    }catch(error){
        return ("Something went wrong!")
    }
    
}
