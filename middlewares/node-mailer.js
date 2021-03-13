const nodeMailer = require('nodemailer');
const dotenv = require('dotenv');
const QRCode = require('qrcode');

dotenv.config();

const email = process.env.nodeMailerEmail;
const password = process.env.nodeMailerPassword;

const transporter = nodeMailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: email,
    pass: password,
    // Get From Google Console OAuth Credential
    clientId: process.env.nodeMailerClId,
    clientSecret: process.env.nodeMailerSecret,
    // Get From Google Developer OAuth20 PlayGround
    refreshToken: process.env.nodeMailerRefreshToken,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = {
  registerByMail: (receiverEmail, otp) => {
    // console.log('Sending mail!');
    const mailOptions = {
      from: `"My Table Planner" ${email}`,
      to: `${receiverEmail}`,
      subject: 'Activate Your Account Via Google',
      text: `Provide Following OTP To Activate Your Account: ${otp} \n Please do not provide this OTP for anyone else!`,
    };
    return new Promise((resolve) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          resolve({ success: false, error });
        } else {
          resolve({ success: true, info });
        }
      });
    });
  },

  resendOTP: (receiverEmail, otp, reason) => {
    const mailOptions = {
      from: `"My Table Planner" ${email}`,
      to: `${receiverEmail}`,
      subject: 'Resend OTP',
      text: `Provide Following OTP To ${reason} Your Account: ${otp} \n  If this is not you, ignore this email!`,
    };
    return new Promise((resolve) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          resolve({ success: false, error });
        } else {
          resolve({ success: true, info });
        }
      });
    });
  },

  resetPassword: (receiverEmail, otp) => {
    const mailOptions = {
      from: `"My Table Planner" ${email}`,
      to: `${receiverEmail}`,
      subject: 'Resend OTP For Resetting Password',
      text: `Provide Following OTP To Activate Reset Your Password Your Password: ${otp} \n If this is not you, ignore this email!`,
    };
    return new Promise((resolve) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          resolve({ success: false, error });
        } else {
          resolve({ success: true, info });
        }
      });
    });
  },

  sendQRCodeToGuests: (receivers, event) => {
    receivers.forEach((receiver) => {
      const data = {
        eventId: event._id,
        mailOfGuest: receiver,
      };
      const stringData = JSON.stringify(data);
      QRCode.toDataURL(stringData, (err, code) => {
        if (err) throw err;
        const mailOptions = {
          from: `"My Table Planner" ${email}`,
          to: `${receiver}`,
          subject: `Invite you attend ${event.name}`,
          html: `<img src="${code}">`,
        };
        transporter.sendMail(mailOptions, (error) => {
          if (error) {
            throw error;
          }
        });
      });
    });
  },
};
