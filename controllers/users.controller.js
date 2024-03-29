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
    if (!req.body.expoToken) {
      res.status(400).json(CustomResponse.BAD_REQUEST);
    } else {
      await Users.updateExpoToken(req.user._id, req.body.expoToken, (err1, document) => {
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
  },
  updateUserInfo: async (req, res) => {
    const { user } = req.body;
    if (!user) {
      res.status(400).json(CustomResponse.BAD_REQUEST);
    } else {
      await Users.updateUserInfo(req.user._id, user, (err1, document) => {
        if (err1) {
          const response = CustomResponse.SERVER_ERROR;
          response.trace = err1;
          res.status(500).json(response);
        } else {
          res.status(200).json({
            message: {
              msgBody: 'Successfully update user info!',
              msgError: true,
            },
            document,
          });
        }
      });
    }
  },
  changePassword: async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json(CustomResponse.BAD_REQUEST);
    } else {
      Users.findOne({ _id: req.user._id })
        .then((value) => {
          if (!value) {
            res.status(400).json({
              message: {
                msgBody: 'User not found or deleted!',
                msgError: true,
              },
            });
          } else {
            value.changePassword(value, currentPassword, newPassword, (err1, document) => {
              if (err1 && !err1.errCode) {
                const response = CustomResponse.SERVER_ERROR;
                response.trace = err1;
                res.status(500).json(response);
              } else if (err1 && err1.errCode) {
                res.status(400).json(err1);
              } else {
                res.status(200).json({
                  message: {
                    msgBody: 'Change password successfully!',
                    msgError: false,
                  },
                  trace: document,
                });
              }
            });
          }
        })
        .catch((reason) => {
          const response = CustomResponse.SERVER_ERROR;
          response.trace = reason;
          res.status(500).json(response);
        });
    }
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
        const { email, role, fullName, id } = callBack;
        res.status(200).json({
          isAuthenticated: true,
          user: {
            email,
            role,
            fullName,
            id,
          },
          access_token: token,
        });
      }
    })(req, res, next);
  },
  // Refresh token here
  authenticated: async (req, res) => {
    const { email, role, fullName } = req.user;
    res.status(200).json({
      isAuthenticated: true,
      user: {
        email,
        role,
        fullName,
      },
      access_token: req.headers.access_token,
    });
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
          Users.createUserWithOTP(
            {
              email: username,
              password,
              fullName,
            },
            otp,
            (err, document) => {
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
            },
          );
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
          res.status(400).json(err);
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
      Users.findOne({ email: req.body.email }, async (err, userDocument) => {
        if (err) {
          const response = CustomResponse.SERVER_ERROR;
          response.trace = err;
          res.status(500).json(response);
        } else if (!userDocument) {
          res.status(400).json({
            message: {
              msgBody: 'User does not exist!',
              msgError: true,
            },
            errCode: 'ERR_USER_NOT_FOUND',
          });
        } else {
          const newOTP = randOTP();
          // 3 days
          const otpReset = {
            otp: newOTP,
            expires: new Date(+new Date() + 3 * 24 * 60 * 60 * 1000),
          };
          const result = await nodeMailer.resetPassword(req.body.email, newOTP);
          if (result.success) {
            Users.resetOTP(req.body.email, otpReset, (err1, document) => {
              if (err1) {
                const response = CustomResponse.SERVER_ERROR;
                response.trace = err1;
                res.status(500).json(response);
              } else {
                res.status(200).json({
                  message: {
                    msgBody: `OTP Has Been Sent To: ${document.email}`,
                    msgError: false,
                  },
                  data: document.email,
                });
              }
            });
          } else {
            res.status(500).json(CustomResponse.SERVER_ERROR);
          }
        }
      });
    }
  },
  resetPassword: async (req, res) => {
    if (!req.body.email || !req.body.otp || !req.body.password) {
      res.status(400).json(CustomResponse.BAD_REQUEST);
    } else {
      const { email, otp, password, confirmPassword } = req.body;
      if (password !== confirmPassword) {
        res.status(400).json(CustomResponse.BAD_REQUEST);
      }
      Users.resetUserPassword(email, otp, password, confirmPassword, (err, successResponse) => {
        if (err) {
          res.status(500).json(err);
        } else {
          res.status(200).json(successResponse);
        }
      });
    }
  },
  getUserInfo: async (req, res) => {
    const { email, fullName, phoneNumber, description, avatar } = req.user;
    res.status(200).json({
      message: {
        msgBody: 'Get user info successfully!',
        msgError: false,
      },
      data: {
        email,
        fullName,
        phoneNumber,
        description,
        avatar,
      },
    });
  },
};
