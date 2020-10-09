module.exports = {
  connectionString: process.env.MONGODB_URI,
  secret: process.env.JWT_SECRET,
  emailFrom: process.env.EMAIL_FROM,
  smtpOptions: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  }
};
