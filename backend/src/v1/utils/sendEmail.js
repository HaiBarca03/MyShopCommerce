const nodemailer = require('nodemailer');

const sendEmail = async (email, newPassword) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.MAIL_APP,
            pass: process.env.PASS_MAIL_APP,
        },
    });

    console.log('email', email)
    console.log('newPassword', newPassword)
    const mailOptions = {
        from: 'hdoan82300@gmail.com',
        to: email,
        subject: 'Mật khẩu mới',
        text: `Mật khẩu mới của bạn là: ${newPassword}`
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail }