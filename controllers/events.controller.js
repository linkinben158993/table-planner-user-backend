const passport = require('passport');
const Users = require('../models/mUsers');
const Events = require('../models/mEvents');
const Guests = require('../models/mGuests');
const nodeMailer = require('../middlewares/node-mailer');

const BAD_REQUEST = {
  message: {
    msgBody: 'Bad User Input',
    msgError: true,
  },
};

const SERVER_ERROR = {
  SERVER_ERROR: 'Server Error',
};

// an@gmail.com 123456
// const host = '600ea488f70da93fde2b3acc';

module.exports = {
  // Currently hardcode for default user for convenience change immediately on applying passport
  getAllEvents: async (req, res) => {
    passport.authenticate('jwt', { session: false }, (err, callBack) => {
      if (err) {
        res.status(500).json(err);
      }
      if (!callBack) {
        res.status(403).json('Forbidden');
      } else {
        Users.findOne({ _id: callBack._id })
          .then((document) => {
            res.status(200).json({ document });
          })
          .catch((err1) => {
            res.status(500).json({
              SERVER_ERROR,
              err1,
            });
          });
      }
    })(req, res);
  },
  addNewEvent: async (req, res) => {
    passport.authenticate('jwt', { session: false }, (err, callBack) => {
      if (err) {
        res.status(500).json(err);
      }
      if (!callBack) {
        res.status(403).json('Forbidden');
      } else {
        const { eventName, eventDescription, tableType, eventLabel } = req.body;
        // Redefine host with passport jwt
        if (!eventName || !eventDescription || !tableType) {
          res.status(400).json(BAD_REQUEST);
        } else {
          const { _id } = callBack;
          const newEvent = {
            eventName,
            eventDescription,
            tableType,
            eventLabel,
          };
          Events.addEvent(_id, newEvent, (err1, document) => {
            if (err1) {
              res.status(500).json(SERVER_ERROR);
            } else {
              res.status(200).json({
                message: {
                  msgBody: 'Add New Event Successful!',
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
  editEvent: async (req, res) => {
    passport.authenticate('jwt', { session: false }, (err, callBack) => {
      const { eventId, eventName, eventDescription } = req.body;
      if (err) {
        res.status(500).json(SERVER_ERROR);
      }
      if (!eventId || !eventName || !eventDescription) {
        res.status(400).json(BAD_REQUEST);
      } else if (!callBack) {
        res.status(403).json('Forbidden');
      } else {
        // If if events is from of this user's possession?
        const newEvent = { eventId, eventName, eventDescription };
        Events.editEvent(callBack._id, newEvent, (err1, document) => {
          if (err1) {
            res.status(500).json(SERVER_ERROR);
          } else {
            res.status(200).json({
              message: {
                msgBody: 'Edit Event Successful!',
                msgError: false,
              },
              document,
            });
          }
        });
      }
    })(req, res);
  },
  addOrUpdateTable: async (req, res) => {
    passport.authenticate('jwt', { session: false }, (err, callBack) => {
      const { eventId, tables } = req.body;
      if (err) {
        res.status(500).json(SERVER_ERROR);
      }
      if (!eventId || !tables) {
        res.status(400).json(BAD_REQUEST);
      } else if (!callBack) {
        res.status(403).json('Forbidden');
      } else {
        // If if events is from of this user's possession?
        Events.updateOne({ _id: eventId }, { $set: { tables } })
          .then((document) => {
            res.status(200).json({ document });
          })
          .catch((err1) => {
            res.status(500).json({
              SERVER_ERROR,
              err1,
            });
          });
      }
    })(req, res);
  },
  getTableOfEvent: async (req, res) => {
    passport.authenticate('jwt', { session: false }, (err, callBack) => {
      const { eventId } = req.body;
      if (err) {
        res.status(500).json(SERVER_ERROR);
      }
      if (!eventId) {
        res.status(400).json(BAD_REQUEST);
      } else if (!callBack) {
        res.status(403).json('Forbidden');
      } else {
        // If if events is from of this user's possession?
        Events.findById(eventId)
          .select('tables')
          .then((document) => {
            res.status(200).json({ document });
          })
          .catch((err1) => {
            res.status(500).json({
              SERVER_ERROR,
              err1,
            });
          });
      }
    })(req, res);
  },
  sendMailToAllGuest: async (req, res) => {
    passport.authenticate('jwt', { session: false }, (err, callBack) => {
      const { eventId } = req.body;
      if (err) {
        res.status(500).json(SERVER_ERROR);
      }
      if (!eventId) {
        res.status(400).json(BAD_REQUEST);
      } else if (!callBack) {
        res.status(403).json('Forbidden');
      } else {
        Events.findOne({ _id: eventId }, 'name description startTime creator')
          .populate('creator')
          .then((event) => {
            // Get all guest's emails of event
            Guests.find({ event: eventId })
              .select('email')
              .then((mails) => {
                if (mails.length === 0) {
                  nodeMailer.sendQRCodeToGuests(['thienan.nguyenhoang311@gmail.com'], event);
                } else {
                  nodeMailer.sendQRCodeToGuests(mails, event);
                }
              })
              .catch((err1) => {
                res.status(500).json({
                  SERVER_ERROR,
                  err1,
                });
              });
            res.status(200).json({ msg: 'Send mail success!' });
          })
          .catch((err1) => {
            res.status(500).json({
              SERVER_ERROR,
              err1,
            });
          });
      }
    })(req, res);
  },
};
