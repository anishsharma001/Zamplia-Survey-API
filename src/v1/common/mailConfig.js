'use strict';
const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    host: 'mail.exchange.telus.com',
    port: 993,
    secure: true, // true for 465, false for other ports
    auth: {
        user:'requests@logitgroup.com',
        pass: 'Trail4Requests@'// generated ethereal password
    }
});

module.exports = transporter;