const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendVerificationEmail = (to, verificationLink) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'Verificación de correo electrónico',
      html: `<p>Por favor, haz clic en el siguiente enlace para verificar tu cuenta:</p><a href="${verificationLink}">Verificar Email</a>`
    };
  
    return transporter.sendMail(mailOptions);
  };

module.exports = sendVerificationEmail;
