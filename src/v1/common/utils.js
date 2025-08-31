const mail = require('./sendMail');
const SimpleCrypto = require('simple-crypto-js').default;

async function getProjectInfo(studyId, TID) {
    return new Promise(function (resolve, reject) {
        let data = {};
        let query = `select s._id, s.studyName, s.loi, s.fees, m.thirdPartyId, v.vendorName, m.vendorCpi, u.email from studies as s 
        JOIN mappings as m ON m.studyId = s._id
        LEFT JOIN vendors as v ON v._id = m.thirdPartyId
        LEFT JOIN users as u ON u.user_id = s.projectManager 
        where m.thirdPartyId = '${TID}' AND s._id = '${studyId}' `;
        queryWrapper.execute(query, [], function (result) {
            if (result.errno && result.errno !== undefined) {
                data.success = false;
            } else {
                if (result.length > 0) {
                    data.success = true;
                    data.result = result;
                } else {
                    data.success = false;
                }
            }
            resolve(data);
        });
    });
}

async function sendProjectMail(surveyData, subject) {
    let email = 'bipin.sinha@zamplia.com';
    // let email = 'subham.leonids@gmail.com';

    let studyId = '';
    let studyName = '';
    let LOI = '';
    let cpi = '';
    let vendorCpi = '';
    let vendorId = '';
    let vendorName = '';

    if (surveyData.success) {
        var _secretKey = "zebra";
        var simpleCrypto = new SimpleCrypto(_secretKey);
        if (surveyData.result[0].email && surveyData.result[0].email.length > 0) {
            try {
                email = simpleCrypto.decrypt(surveyData.result[0].email) + " , bipin.sinha@zamplia.com";
            } catch (e) { }
        }
        studyId = surveyData.result[0]._id;
        studyName = surveyData.result[0].studyName;
        LOI = surveyData.result[0].loi;
        cpi = surveyData.result[0].fees;
        vendorCpi = surveyData.result[0].vendorCpi;
        vendorId = surveyData.result[0].thirdPartyId;
        vendorName = surveyData.result[0].vendorName;
    }

    let mailData = {
        to: email,
        from: 'requests@logitgroup.com',
        subject: subject,
        html: '<html>\
        <body>\
        <p>The study specs are as follows:<br/>\
        Study id = '+ studyId + '<br/>\
        Study Name = '+ studyName + '<br/>\
        LOI = '+ LOI + '<br/>\
        CPI = '+ cpi + '<br/>\
        VENDOR CPI = '+ vendorCpi + '<br/>\
        message = '+ subject + '<br/>\
        Vendor Id = '+ vendorId + '<br/>\
        Vendor Name = '+ vendorName + '<br/>\
        <p>Thanks <br/>\
        Logit Team<p>\
        </body>\
        </html>',
    };
    mail.sendMail(mailData);
}

module.exports = {
    getProjectInfo: getProjectInfo,
    sendProjectMail: sendProjectMail
}