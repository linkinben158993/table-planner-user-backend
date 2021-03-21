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
        res.status(500).json(err1);
      }
      if (!callBack) {
        res.status(403).json('Forbidden');
      } else {
        const { guestName, guestMail, guestPhone, eventId } = req.body;
        if (!guestName || !guestMail || !eventId) {
          res.status(400).json(BAD_REQUEST);
        } else {
          const newGuest = {
            guestName,
            guestMail,
            guestPhone,
            eventId,
          };
          Guests.addGuest(newGuest, (err2, document) => {
            if (err2) {
              res.status(500).json(SERVER_ERROR);
            } else {
              res.status(200).json({
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

  getGuestList: async (req, res) => {
    passport.authenticate('jwt', { session: false }, (err1, callBack) => {
      if (err1) {
        res.status(500).json(err1);
      }
      if (!callBack) {
        res.status(403).json('Forbidden');
      } else {
        const eventId = req.params.id;
        if (!eventId) {
          res.status(400).json(BAD_REQUEST);
        } else {
          Guests.getGuestListInEvent(eventId, (err2, document) => {
            if (err2) {
              res.status(500).json(SERVER_ERROR);
            } else {
              res.status(200).json({
                message: {
                  msgBody: 'Get Guest List Successful!',
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

  editGuest: async (req, res) => {
    passport.authenticate('jwt', { session: false }, (err1, callBack) => {
      if (err1) {
        res.status(500).json(err1);
      }
      if (!callBack) {
        res.status(403).json('Forbidden');
      } else {
        const { guestId, guestName, guestMail, guestPhone } = req.body;
        if (!guestName || !guestMail || !guestId) {
          res.status(400).json(BAD_REQUEST);
        } else {
          const guest = { guestId, guestName, guestMail, guestPhone };
          Guests.editGuest(guest, (err2, document) => {
            if (err2) {
              res.status(500).json(SERVER_ERROR);
            } else {
              res.status(200).json({
                message: {
                  msgBody: 'Edit Guest Successful!',
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

  deleteGuest: async (req, res) => {
    passport.authenticate('jwt', { session: false }, (err1, callBack) => {
      if (err1) {
        res.status(500).json(err1);
      }
      if (!callBack) {
        res.status(403).json('Forbidden');
      } else {
        const guestId = req.body;
        if (!guestId) {
          res.status(400).json(BAD_REQUEST);
        } else {
          Guests.deleteGuestById(guestId, (err2, document) => {
            if (err2) {
              res.status(500).json(SERVER_ERROR);
            } else {
              res.status(200).json({
                message: {
                  msgBody: 'Delete Guest Successful!',
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
  importGuests: async (req, res) => {
    passport.authenticate('jwt', { session: false }, async (err1, callBack) => {
      if (err1) {
        res.status(500).json(err1);
      }
      if (!callBack) {
        res.status(403).json('Forbidden');
      } else {
        //
        const temp = req.body;
        const guests = [];
        temp.forEach((element) => {
          const { name, email, phoneNumber, eventId, table } = element;
          const guest = {
            name,
            email,
            phoneNumber,
            priority: '',
            event: eventId,
            table,
          };
          guests.push(guest);
        });
        Guests.importGuestsToEvent(guests, (err, response) => {
          if (err) {
            res.status(500).json(SERVER_ERROR);
          } else {
            res.status(200).json({
              message: {
                msgBody: 'Import Guest Successful!',
                msgError: false,
              },
              response,
            });
          }
        });
      }
    })(req, res);
  },
  assignTable: async (req, res) => {
    passport.authenticate('jwt', { session: false }, async (err1, callBack) => {
      if (err1) {
        res.status(500).json(err1);
      }
      if (!callBack) {
        res.status(403).json('Forbidden');
      } else {
        const guestList = [
          {
            guestId: '6056286519027c2d666365fd',
            table: {
              id: '1',
              seatNo: 1,
            },
          },
          {
            guestId: '6056286b19027c2d666365fe',
            table: {
              id: '2',
              seatNo: 2,
            },
          },
          {
            guestId: '6056287019027c2d666365ff',
            table: {
              id: '3',
              seatNo: 3,
            },
          },
        ];
        Guests.assignGuestsToSeats(guestList, (err, document) => {
          if (err) {
            res.status(500).json(SERVER_ERROR);
          } else {
            res.status(201).json({
              message: {
                msgBody: 'Assign Successful',
                msgError: false,
              },
              trace: document,
            });
          }
        });
      }
    })(req, res);
  },
};
