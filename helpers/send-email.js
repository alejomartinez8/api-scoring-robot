const nodemailer = require('nodemailer');
const config = require('../config');

module.exports = sendEmail;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendEmail({ to, subject, html, from = config.emailFrom }) {
  await transporter.sendMail({ from, to, subject, html }, (err, info) => {
    console.log('SenMail');
    if (err) {
      console.log('error:', err);
    } else {
      console.log(info.envelope);
      console.log(info.messageId);
    }
  });
}
