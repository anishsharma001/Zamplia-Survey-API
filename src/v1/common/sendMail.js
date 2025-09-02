const sgMail = require('@sendgrid/mail');
sgMail.setApiKey("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");

async function sendMail(msg) {
    return new Promise(function (resolve, reject) {
        sgMail.send(msg, (error, info) => {
            if (error) {
                let data = {};
                data.success = false;
                data.error = error;
                resolve(data);
            } else {
                let data = {};
                data.success = true;
                resolve(data);
            }
        });
    });
}

module.exports = {
    sendMail: sendMail
}