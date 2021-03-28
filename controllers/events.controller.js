const passport = require('passport');
const Events = require('../models/mEvents');
const Guests = require('../models/mGuests');
const nodeMailer = require('../middlewares/node-mailer');
const CustomResponse = require('../constants/response.message');

// an@gmail.com 123456
// const host = '600ea488f70da93fde2b3acc';

module.exports = {
  getEventByID: async (req, res) => {
    passport.authenticate('jwt', { session: false }, (err, callBack) => {
      if (err) {
        res.status(500).json(err);
      }
      if (!callBack) {
        res.status(403).json('Forbidden');
      } else {
        const { id } = req.params;
        if (!id) {
          res.status(400).json(CustomResponse.BAD_REQUEST);
        } else {
          Events.getEventById(id, (err1, document) => {
            if (err1) {
              const response = CustomResponse.SERVER_ERROR;
              response.trace = err1;
              res.status(500).json(response);
            } else {
              res.status(200).json(document);
            }
          });
        }
      }
    })(req, res);
  },
  // Currently hardcode for default user for convenience change immediately on applying passport
  getAllEvents: async (req, res) => {
    passport.authenticate('jwt', { session: false }, (err, callBack) => {
      if (err) {
        const response = CustomResponse.SERVER_ERROR;
        response.trace = err;
        res.status(500).json(response);
      }
      if (!callBack) {
        res.status(403).json(CustomResponse.FORBIDDEN);
      } else {
        Events.find({ creator: callBack._id })
          .then((document) => {
            res.status(200).json({ document });
          })
          .catch((err1) => {
            const response = CustomResponse.SERVER_ERROR;
            response.trace = err1;
            res.status(500).json(response);
          });
      }
    })(req, res);
  },
  addNewEvent: async (req, res) => {
    passport.authenticate('jwt', { session: false }, (err, callBack) => {
      if (err) {
        const response = CustomResponse.SERVER_ERROR;
        response.trace = err;
        res.status(500).json(response);
      }
      if (!callBack) {
        res.status(403).json(CustomResponse.FORBIDDEN);
      } else {
        const { name, description } = req.body;
        // Redefine host with passport jwt
        if (!name || !description) {
          res.status(400).json(CustomResponse.BAD_REQUEST);
        } else {
          const { _id } = callBack;
          const newEvent = {
            name,
            description,
          };
          Events.addEvent(_id, newEvent, (err1, document) => {
            if (err1) {
              const response = CustomResponse.SERVER_ERROR;
              response.trace = err1;
              res.status(500).json(response);
            } else {
              res.status(200).json({
                message: {
                  msgBody: 'Add New Event Successful!',
                  msgError: false,
                },
                data: document,
              });
            }
          });
        }
      }
    })(req, res);
  },
  editEvent: async (req, res) => {
    passport.authenticate('jwt', { session: false }, (err, callBack) => {
      const { id, name, description, elements } = req.body;
      if (err) {
        const response = CustomResponse.SERVER_ERROR;
        response.trace = err;
        res.status(500).json(response);
      }
      if (!id || !name || !description) {
        res.status(400).json(CustomResponse.BAD_REQUEST);
      } else if (!callBack) {
        res.status(403).json('Forbidden');
      } else {
        // If if events is from of this user's possession?
        const newEvent = {
          id,
          name,
          description,
          elements,
        };
        Events.editEvent(callBack._id, newEvent, (err1, document) => {
          if (err1) {
            const response = CustomResponse.SERVER_ERROR;
            response.trace = err1;
            res.status(500).json(response);
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
  sendMailToAllGuest: async (req, res) => {
    passport.authenticate('jwt', { session: false }, (err, callBack) => {
      const { id } = req.body;
      if (err) {
        const response = CustomResponse.SERVER_ERROR;
        response.trace = err;
        res.status(500).json(response);
      }
      if (!id) {
        res.status(400).json(CustomResponse.BAD_REQUEST);
      } else if (!callBack) {
        res.status(403).json(CustomResponse.FORBIDDEN);
      } else {
        Events.findOne({ _id: id }, 'name description startTime creator')
          .populate('creator')
          .then((event) => {
            // Get all guest's emails of event
            Guests.find({ event: id })
              .select('email')
              .then(async (mails) => {
                if (mails.length === 0) {
                  res.status(400).json({
                    message: {
                      msgBody: 'No guests found!',
                      msgError: true,
                    },
                  });
                } else {
                  const result = await nodeMailer.sendQRCodeToGuests(mails, event);
                  if (result.success) {
                    res.status(200).json({
                      msg: { msgBody: 'Send mail success!', msgError: false },
                    });
                  } else {
                    res.status(500).json(CustomResponse.SERVER_ERROR);
                  }
                }
              })
              .catch((err1) => {
                const response = CustomResponse.SERVER_ERROR;
                response.trace = err1;
                res.status(500).json(response);
              });
          })
          .catch((err1) => {
            const response = CustomResponse.SERVER_ERROR;
            response.trace = err1;
            res.status(500).json(response);
          });
      }
    })(req, res);
  },
};
