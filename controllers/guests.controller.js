const passport = require('passport');
const Guests = require('../models/mGuests');

const BAD_REQUEST = {
  message: {
    msgBody: 'Bad User Input',
    msgError: true,
  },
};

const SERVER_ERROR = {
  SERVER_ERROR: 'Server Error',
};

module.exports = {
  addNewGuest: async (req, res) => {
    passport.authenticate('jwt', { session: false }, (err1, callBack) => {
      if (err1) {
        res.status(500)
          .json(err1);
      }
      if (!callBack) {
        res.status(403)
          .json('Forbidden');
      } else {
        const {
          guestName, guestMail, guestPhone, eventId,
        } = req.body;
        if (!guestName || !guestMail || !eventId) {
          res.status(400)
            .json(BAD_REQUEST);
        } else {
          const newGuest = {
            guestName,
            guestMail,
            guestPhone,
            eventId,
          };
          Guests.addGuest(newGuest, (err2, document) => {
            if (err2) {
              res.status(500)
                .json(SERVER_ERROR);
            } else {
              res.status(200)
                .json({
                  message: {
                    msgBody: 'Add New Guest Successful!',
                    msgError: false,
                  },
                  document,
                });
            }
          });
        }
      }
    })(req, res);
  },
};
