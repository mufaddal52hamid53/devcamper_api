const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, message }) => {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  let info = await transporter.sendMail({
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: subject,
    text: message,
  });
  console.log('Message Sent', info.messageId);
};

module.exports = sendEmail;
