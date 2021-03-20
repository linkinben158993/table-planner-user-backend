const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const dotenv = require('dotenv');
const Users = require('../models/mUsers');

dotenv.config();
const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.access_token;
  }
  if (req && req.headers) {
    token = req.headers.access_token;
  }
  return token;
};

// Authorization
passport.use(
  'jwt',
  new JWTStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.secretOrKey,
    },
    (payload, done) => {
      Users.findById({ _id: payload.sub }, (err, user) => {
        // Something wrong with service provider
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      });
    },
  ),
);

// Local Strategy
passport.use(
  'local',
  new LocalStrategy((username, password, done) => {
    Users.findOne({ email: username }, (err, user) => {
      // Something happened with database
      if (err) {
        return done(err);
      }
      // User not found
      if (!user) {
        // console.log('Passport: User not found!');
        return done({
          message: { msgBody: 'Password/Username not match!', msgError: true },
          errCode: 'ERR_USER_NOT_FOUND',
        });
      }
      // User has not been activated
      if (!user.activated) {
        // console.log('Passport: User has not been activated!');
        return done({
          message: { msgBody: 'User has not been activated!', msgError: true },
          errCode: 'ERR_USER_NOT_ACTIVATED',
        });
      }
      // User has been blocked by admin
      if (user.blocked) {
        // console.log('Passport: User has been blocked by admin!');
        return done({
          message: {
            msgBody: 'User has been blocked by admin!',
            msgError: true,
          },
          errCode: 'ERR_BLOCKED_USER',
        });
      }

      return user.checkPassword(password, done);
    });
  }),
);
