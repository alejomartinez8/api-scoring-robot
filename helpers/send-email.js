const nodemailer = require('nodemailer');
const config = require('../config');
const { google } = require('googleapis');
const { OAuth2 } = google.auth;

module.exports = sendEmail;

const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground';

const { GOOGLE_ID, GOOGLE_SECRET, GMAIL_REFRESH_TOKEN, EMAIL_FROM } = process.env;

const oauth2Client = new OAuth2(GOOGLE_ID, GOOGLE_SECRET, OAUTH_PLAYGROUND);

async function sendEmail({ to, subject, html, from = config.emailFrom }) {
  try {
    oauth2Client.setCredentials({
      refresh_token: GMAIL_REFRESH_TOKEN
    });
    const res = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: EMAIL_FROM,
        clientID: GOOGLE_ID,
        clientSecret: GOOGLE_SECRET,
        refreshToken: GMAIL_REFRESH_TOKEN,
        accessToken: res.token
      }
    });

    return await transporter.sendMail({ from, to, subject, html });
  } catch (error) {
    console.log(error);
  }
}
