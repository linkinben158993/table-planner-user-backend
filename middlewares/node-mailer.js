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
    const mailOptions = {
      from: `"My Table Planner" ${email}`,
      to: `${receiverEmail}`,
      subject: 'Activate Your Account Via Google',
      text: `Provide Following OTP To Activate Your Account: ${otp} \n Please do not provide this OTP for anyone else!`,
    };
    return new Promise((resolve) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          resolve({
            success: false,
            error,
          });
        } else {
          resolve({
            success: true,
            info,
          });
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
          resolve({
            success: false,
            error,
          });
        } else {
          resolve({
            success: true,
            info,
          });
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
          resolve({
            success: false,
            error,
          });
        } else {
          resolve({
            success: true,
            info,
          });
        }
      });
    });
  },

  sendQRCodeToGuests: async (receivers, event) => {
    const data = {
      eventId: event._id,
    };

    const emails = receivers.map((guestMail) => guestMail.email);
    const stringData = JSON.stringify(data);

    const result = await QRCode.toDataURL(stringData);
    const mailOptions = {
      from: `"My Table Planner" ${email}`,
      to: emails,
      subject: `Invite you attend ${event.name}`,
      text: 'Please present qr code provided below for checking in event!',
      attachDataUrls: true,
      html: `
                Invite you attend ${event.name} <br>
                Please present qr code provided below for checking in event! <br>
                <img src='${result}'>
          `,
    };
    return new Promise((resolve) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          resolve({
            success: false,
            error,
          });
        } else {
          resolve({
            success: true,
            info,
          });
        }
      });
    });
  },
};
