const nodeMailer = require('nodemailer');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const QRCode = require('qrcode');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');

dotenv.config();

const email = process.env.nodeMailerEmail;
const oAuth2Client = new google.auth.OAuth2({
  CLIENT_ID: process.env.nodeMailerClId,
  ClIENT_SECRET: process.env.nodeMailerSecret,
  REDIRECT_URI: 'https://developers.google.com/oauthplayground',
});
oAuth2Client.setCredentials({
  refresh_token: process.env.nodeMailerRefreshToken,
});

const transporter = nodeMailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true, // true for 465, false for other ports
  pool: true,
  auth: {
    type: 'OAuth2',
    user: email,
    // Get From Google Console OAuth Credential
    clientId: process.env.nodeMailerClId,
    clientSecret: process.env.nodeMailerSecret,
    // Get From Google Developer OAuth20 PlayGround
    refreshToken: process.env.nodeMailerRefreshToken,
    access_token: async () => oAuth2Client.getAccessToken(),
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.use(
  'compile',
  hbs({
    viewEngine: {
      extName: '.hbs',
      partialDir: './views/',
      defaultLayout: false,
    },
    viewPath: './views/',
    extName: '.hbs',
  }),
);

module.exports = {
  registerByMail: (receiverEmail, otp) => {
    const mailOptions = {
      from: `"My Table Planner" ${email}`,
      to: `${receiverEmail}`,
      subject: 'Activate Your Account Via Google',
      text: `Provide Following OTP To Activate Your Account: ${otp} \n Please do not provide this OTP for anyone else!`,
      template: 'register',
      attachments: [
        {
          filename: 'Logo.png',
          path: path.join(__dirname, '../', '/public/images/Logo.png'),
          cid: 'logo',
        },
      ],
      context: {
        otp,
        host: process.env.host || '',
      },
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

  resetPassword: async (receiverEmail, otp) => {
    const mailOptions = {
      from: `"My Table Planner" ${email}`,
      to: `${receiverEmail}`,
      subject: 'OTP For Resetting Password',
      text: `Provide Following OTP To Activate Reset Your Password Your Password: ${otp} 
      \n If this is not you, ignore this email!`,
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

  sendQRCodeToGuests: async (receivers, event, callBack) => {
    const promises = [];

    for (let i = 0; i < receivers.length; i += 1) {
      const data = {
        eventId: event._id,
        guestId: receivers[i].id,
      };

      const stringData = JSON.stringify(data);

      // eslint-disable-next-line no-await-in-loop
      const result = await QRCode.toDataURL(stringData);
      const mailOptions = {
        from: `"My Table Planner" ${email}`,
        to: receivers[i].email,
        subject: `Invite you attend ${event.name}`,
        text: 'Please present qr code provided below for checking in event!',
        attachDataUrls: true,
        html: `
                  Invite you attend ${event.name} <br>
                  Please present QR code provided below for checking in event! <br>
                  <img src='${result}'>
                  <a href = ' https://client-web-front-end.vercel.app/information/${event._id}'>Click to open app</a>

            `,
      };

      promises.push(
        new Promise((resolve, reject) => {
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              reject(error);
            } else {
              resolve(info);
            }
          });
        }),
      );
    }
    Promise.all(promises).then(
      (info) => {
        callBack(null, info);
      },
      (err) => {
        callBack(err);
      },
    );
  },
  eventReminderHost: (receiver, event) => {
    const mailOptions = {
      from: `"My Table Planner" ${email}`,
      to: `${receiver}`,
      subject: `Hosting of event: ${event}`,
      text: "It's almost time for your event, and don't forget you're the host.",
    };
    return new Promise((resolve) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          resolve(error);
        } else {
          resolve(null, info);
        }
      });
    });
  },
  eventReminderGuests: (receivers, event, callBack) => {
    const promises = [];

    for (let i = 0; i < receivers.length; i += 1) {
      const mailOptions = {
        from: `"My Table Planner" ${email}`,
        to: receivers[i].email,
        subject: `Reminder To Your Event: ${event.name}`,
        attachDataUrls: true,
        html: `We hope you have prepared yourself for our event, this is an automatic reminder for your upcoming event
               <br>Please be on time for your event which is at: ${event.startTime}`,
      };
      promises.push(
        new Promise((resolve, reject) => {
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              reject(error);
            } else {
              resolve(info);
            }
          });
        }),
      );
    }
    Promise.all(promises).then(
      (info) => {
        callBack(null, info);
      },
      (err) => {
        callBack(err);
      },
    );
  },
};
