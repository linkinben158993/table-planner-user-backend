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
      partialDir: './views/emails/',
      defaultLayout: false,
    },
    viewPath: './views/emails/',
    extName: '.hbs',
  }),
);

const defaultUrl = 'https://res.cloudinary.com/hungkhaankiettuan/image/upload/v1622980399/Logo/Logo_bw33oc.png';

module.exports = {
  registerByMail: (receiverEmail, otp) => {
    const mailOptions = {
      from: `"My Table Planner" ${email}`,
      to: `${receiverEmail}`,
      subject: 'Activate Your Account Via Google',
      text: `Provide Following OTP To Activate Your Account: ${otp} \n Please do not provide this OTP for anyone else!`,
      attachDataUrls: true,
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
      attachDataUrls: true,
      template: 'forget-password',
      attachments: [
        {
          filename: 'Logo.png',
          path: path.join(__dirname, '../', '/public/images/Logo.png'),
          cid: 'logo',
        },
      ],
      context: {
        msgBody: 'Provide Following OTP To Activate Reset Your Password Your Password',
        sideNote: 'If this is not you, ignore this email!',
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

  sendQRCodeToGuests: async (receivers, event, callBack) => {
    const promises = [];

    for (let i = 0; i < receivers.length; i += 1) {
      const data = {
        eventId: event._id,
        guestId: receivers[i].id,
      };

      const stringData = JSON.stringify(data);

      // eslint-disable-next-line no-await-in-loop
      const result = await QRCode.toDataURL(stringData, {
        width: 400,
        height: 400,
      });
      const mailOptions = {
        from: `"My Table Planner" ${email}`,
        to: receivers[i].email,
        subject: `Invite you attend ${event.name}`,
        text: 'Please present qr code provided below for checking in event!',
        attachDataUrls: true,
        template: 'invite',
        attachments: [
          {
            filename: 'Logo.png',
            path: path.join(__dirname, '../', '/public/images/Logo.png'),
            cid: 'logo',
          },
          {
            filename: 'QRCode.png',
            content: result.split('base64,')[1],
            encoding: 'base64',
          },
        ],
        context: {
          event: event._id,
          msgBody: `Invite you attend ${event.name} `,
          sideNote: 'Please present QR code provided below for checking in event!',
          result,
          host: process.env.host || '',
        },
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
      subject: `Hosting of event: ${event.name}`,
      text: "It's almost time for your event, and don't forget you're the host.",
      attachDataUrls: true,
      template: 'reminder',
      attachments: [
        {
          filename: 'Logo.png',
          path: path.join(__dirname, '../', '/public/images/Logo.png'),
          cid: 'logo',
        },
      ],
      context: {
        id: event._id,
        firstImage: event.urls.length === 0 ? defaultUrl : event.urls[0].url,
        msgHeader: 'Please be prepared for your event!',
        msgBody: "It's almost time for your event, and don't forget you're the host.",
        sideNote: 'Remember to be on time.',
      },
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
        template: 'reminder',
        attachments: [
          {
            filename: 'Logo.png',
            path: path.join(__dirname, '../', '/public/images/Logo.png'),
            cid: 'logo',
          },
        ],
        context: {
          event,
          id: event._id,
          firstImage: event.urls.length === 0 ? defaultUrl : event.urls[0].url,
          msgHeader: 'Please be prepared for your invited event!',
          msgBody:
            'We hope you have prepared yourself for our event, this is an automatic reminder for your upcoming event!',
          sideNote: `Please be on time for your event which is at: ${event.startTime}`,
        },
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
