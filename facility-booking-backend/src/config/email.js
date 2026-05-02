const nodemailer = require('nodemailer');

// Check if all required email environment variables are set
const hasEmailConfig = process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS;

let transporter;

if (hasEmailConfig) {
  // Use configured email service
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: parseInt(process.env.EMAIL_PORT, 10) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log('✉️ Email service configured:', process.env.EMAIL_HOST);
} else {
  // Development fallback: create a test account with Ethereal
  console.log('⚠️ Email configuration missing. Using Ethereal test account for development.');
  
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('📧 Email would be sent (development mode):');
      console.log('   To:', mailOptions.to);
      console.log('   Subject:', mailOptions.subject);
      console.log('   Body preview:', mailOptions.html?.substring(0, 100) + '...');
      return { messageId: 'dev-mode-' + Date.now() };
    }
  };
}

module.exports = transporter;
