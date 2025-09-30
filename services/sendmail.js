const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: "gmail",
    host : "smtp.gamil.com",
    port : 465,
    secure : true,
    auth : {
        user : process.env.USER_EMAIL,
        pass : process.env.USER_PASSWORD
    },tls:{
        rejectUnauthorized : false
    }
});

module.exports = transporter