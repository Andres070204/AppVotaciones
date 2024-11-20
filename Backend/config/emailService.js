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
  const sendPasswordResetEmail = async (email, token) => {
    const resetLink = `http://localhost:3000/html/Usuarios/changePassword.html?token=${token}`;
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER ,
        to: email,
        subject: 'Restablecer contraseña',
        html: `
          <h1>Solicitud de restablecimiento de contraseña</h1>
          <p>Haz clic en el enlace para restablecer tu contraseña:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>Este enlace expira en 15 minutos.</p>
        `
      });
      console.log(`Correo enviado a ${email}`);
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      throw new Error('No se pudo enviar el correo de restablecimiento.');
    }
  };
  
module.exports = { sendVerificationEmail, sendPasswordResetEmail };
