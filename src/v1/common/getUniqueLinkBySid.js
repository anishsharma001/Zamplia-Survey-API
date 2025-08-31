
 const checkUniqueLinkStatus = require('./checkUniqueLinkStatus');
 const getUniqueLink = require('./getUniqueLink'); 
 const updateUniqueLink = require('./updateUniqueLink');
 const transporter = require("../../common/mailConfig");


 async function getUniqueLinkBySid(SID, PID){
    var data = {};
    const checkUniqueLink = await checkUniqueLinkStatus.checkUniqueLinkStatus(SID);
    if(checkUniqueLink.result === false){

        sendMail("kuldeep.leonids@gmail.com", function (msg) {
            });
        data.result = false;
        return data;
    } else {

        if(checkUniqueLink.sendEmail === true){
            sendMail("kuldeep.leonids@gmail.com", function (msg) {
            });
        }

        const uniqueLink = await getUniqueLink.getUniqueLink(SID);
        const updateLink = await updateUniqueLink.updateUniqueLink(uniqueLink.data._id,PID);

        let link = {}
        if(uniqueLink.data.link.substr(uniqueLink.data.link.length - 5) === "<pid>")
        {
            link.firstPartyUrl = uniqueLink.data.link;
        }
        else{
            link.firstPartyUrl = uniqueLink.data.link+"<pid>";
        }

        data.uniqueLink = link;
        data.result = true;
        return data;
    }
}


function sendMail(email, callback) {
    // setup email data with unicode symbols
    let mailOptions = {
        from: 'support@leonids.in', // sender address
        to: email, // list of receivers
        subject: "Unique Link alert on project",
        html: '<html>\
                <body>\
                <p> Hello Dear,</p>\
                <h3>We are welcoming you on studyexchange panel.</h3>\
                <p> Hope You are doing great! <br/>\
                <p> You have less then 10 % unique link on your project. Please upload new sheet of links or disable it. <br/>\
                \
                <p>Thanks <br/>\
                STUDYEXCHANGE TEAM<p>\
                <p>note : please do not reply on this email.</p>\
                </body>\
                </html>'
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            callback(error);
            console.log(error);
        }
        if (info) {
            console.log('Message sent: %s', info.messageId);
            var respo = ('Message sent: %s', info.messageId);
            callback(respo);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
  
    });
  }


module.exports= {
    getUniqueLinkBySid : getUniqueLinkBySid
}