const passport = require('passport');
const JWT = require('jsonwebtoken');
const Users = require('../models/mUsers');
const nodeMailer = require('../middlewares/node-mailer');
// eslint-disable-next-line no-unused-vars
const passportConfig = require('../middlewares/passport');

const CONSTANT = {
  SERVER_ERROR: 'Server Error',
};

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
  login: async (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, callBack) => {
      if (err) {
        res.status(500).json({ errCode: 'Something happened!' });
      } else if (callBack.errCode) {
        res.status(400).json(callBack.message);
      } else {
        const token = signToken(callBack._id);
        const { email, role, fullName } = callBack;
        res
          .status(200)
          .json({ isAuthenticated: true, user: { email, role, fullName }, access_token: token });
      }
    })(req, res, next);
  },
  // Refresh token here
  authenticated: async (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, callBack) => {
      if (err) {
        res.status(500).json({ isAuthenticated: false, user: null, access_token: null });
      } else {
        const { email, role, fullName } = callBack;
        res.status(200)
          .json({
            isAuthenticated: true,
            user: { email, role, fullName },
            access_token: req.headers.access_token,
          });
      }
    })(req, res, next);
  },
  register: async (req, res) => {
    const otp = randOTP();
    const { username, password } = req.body;
    const newUser = new Users({
      email: username,
      password,
      role: 0,
      otp,
      activated: true,
    });
    const result = await nodeMailer.registerByMail(username, otp);
    if (result.success) {
      newUser.save(async (err) => {
        if (err) {
          res.status(500).json(CONSTANT.SERVER_ERROR);
        } else {
          res.status(201).json({
            message: {
              msgBody: 'An Account Has Been Created',
              msgError: false,
            },
          });
        }
      });
    } else {
      res.status(500).json(CONSTANT.SERVER_ERROR);
    }
  },
};
