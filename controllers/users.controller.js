const passport = require('passport');
const JWT = require('jsonwebtoken');
const Users = require('../models/mUsers');
const nodeMailer = require('../middlewares/node-mailer');
// eslint-disable-next-line no-unused-vars
const passportConfig = require('../middlewares/passport');
const CustomResponse = require('../constants/response.message');

const signToken = (userID) => {
  const token = JWT.sign(
    {
      iss: process.env.secretOrKey,
      sub: userID,
    },
    process.env.secretOrKey,
    // 2 Weeks 14 * 1000 * 60 * 60 * 24 Test Refresh Token Below
    { expiresIn: 14 * 1000 * 60 * 60 * 24 },
  );
  return token;
};

const randOTP = () => Math.floor(Math.random() * 1000000);

module.exports = {
  updateExpoToken: async (req, res) => {
    passport.authenticate('jwt', { session: false }, (err, callBack) => {
      if (err) {
        const response = CustomResponse.SERVER_ERROR;
        response.trace = err;
        res.status(500).json(response);
      }
      if (!callBack) {
        res.status(403).json(CustomResponse.FORBIDDEN);
      } else if (!req.body.expoToken) {
        res.status(400).json(CustomResponse.BAD_REQUEST);
      } else {
        Users.updateExpoToken(callBack._id, req.body.expoToken, (err1, document) => {
          if (err1) {
            const response = CustomResponse.SERVER_ERROR;
            response.trace = err1;
            res.status(500).json(response);
          } else {
            res.status(200).json({
              message: {
                msgBody: 'Successfully update device info!',
                msgError: false,
              },
              document,
            });
          }
        });
      }
    })(req, res);
  },

  login: async (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, callBack) => {
      if (err && !err.errCode) {
        const response = CustomResponse.SERVER_ERROR;
        response.trace = err;
        res.status(500).json(response);
      } else if (err && err.errCode) {
        res.status(400).json(err);
      } else {
        const token = signToken(callBack._id);
        const { email, role, fullName } = callBack;
        res.status(200).json({
          isAuthenticated: true,
          user: {
            email,
            role,
            fullName,
          },
          access_token: token,
        });
      }
    })(req, res, next);
  },
  // Refresh token here
  authenticated: async (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, callBack) => {
      if (err) {
        res.status(500).json({
          isAuthenticated: false,
          user: null,
          access_token: null,
        });
      } else {
        const { email, role, fullName } = callBack;
        res.status(200).json({
          isAuthenticated: true,
          user: {
            email,
            role,
            fullName,
          },
          access_token: req.headers.access_token,
        });
      }
    })(req, res, next);
  },
  register: async (req, res) => {
    const otp = randOTP();
    const { username, password, fullName, isNormalFlow } = req.body;
    // Should ensures isNormalFlow and username from clients, password can be based on isNormalFlow
    if (isNormalFlow === undefined || !username) {
      res.status(400).json(CustomResponse.BAD_REQUEST);
    } else {
      const result = await nodeMailer.registerByMail(username, otp);
      if (result.success) {
        // Password should be sent when isNormalFlow is true
        if (isNormalFlow) {
          Users.createUserWithOTP({ email: username, password, fullName }, otp, (err, document) => {
            if (err && !err.errCode) {
              const response = CustomResponse.SERVER_ERROR;
              response.trace = err;
              res.status(500).json(response);
            } else if (err && err.errCode) {
              res.status(400).json(err);
            } else {
              res.status(201).json({
                message: {
                  msgBody: `Mail should be sent to ${username}`,
                  msgError: false,
                },
                trace: document,
              });
            }
          });
        } else {
          Users.createUserWithOTP(
            {
              email: username,
              password: 'SUPER-HARD-TO-REMEMBER-PASSWORD',
              fullName: "User's name",
            },
            otp,
            (err, document) => {
              if (err) {
                const response = CustomResponse.SERVER_ERROR;
                response.trace = err;
                res.status(500).json(response);
              } else {
                res.status(201).json({
                  message: {
                    msgBody: `Mail should be sent to ${username}`,
                    msgError: false,
                  },
                  trace: document,
                });
              }
            },
          );
        }
      } else {
        res.status(500).json(CustomResponse.SERVER_ERROR);
      }
    }
  },
  activate: async (req, res) => {
    const { otp, email } = req.body;
    if (!otp || !email) {
      res.status(400).json(CustomResponse.BAD_REQUEST);
    } else {
      Users.activateAccount(email, otp, (err, document) => {
        if (err) {
          const response = CustomResponse.SERVER_ERROR;
          response.trace = err;
          res.status(400).json(response);
        } else {
          res.status(200).json({
            message: {
              msgBody: `Activate account: ${document.email}`,
              msgError: false,
            },
          });
        }
      });
    }
  },
  forgetPassword: async (req, res) => {
    if (!req.body.email) {
      res.status(400).json(CustomResponse.BAD_REQUEST);
    } else {
      const newOTP = randOTP();
      const result = await nodeMailer.resetPassword(req.body.email, newOTP);
      if (result.success) {
        Users.resetOTP(req.body.email, newOTP, (err, document) => {
          if (err) {
            const response = CustomResponse.SERVER_ERROR;
            response.trace = err;
            res.status(500).json(response);
          } else {
            res.status(200).json({
              message: {
                msgBody: `Please Check Your Email For OTP To Reset Your Password For: ${document.email}`,
                msgError: false,
              },
            });
          }
        });
      } else {
        res.status(500).json(CustomResponse.SERVER_ERROR);
      }
    }
  },
  resetPassword: async (req, res) => {
    if (!req.body.email || !req.body.otp || !req.body.oldPassword || !req.body.newPassword) {
      res.status(400).json(CustomResponse.BAD_REQUEST);
    } else {
      const { email, otp, oldPassword, newPassword } = req.body;
      Users.resetUserPassword(email, otp, oldPassword, newPassword, (err, document) => {
        if (err) {
          const response = CustomResponse.SERVER_ERROR;
          response.trace = err;
          res.status(500).json(response);
        } else {
          const response = {
            message: {
              msgBody: `Change password successfully for ${document.email}`,
              msgError: false,
            },
          };
          res.status(200).json(response);
        }
      });
    }
  },
};
