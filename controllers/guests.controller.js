const passport = require('passport');
const Guests = require('../models/mGuests');
const CustomResponse = require('../constants/response.message');

module.exports = {
  getGuestList: async (req, res) => {
    passport.authenticate('jwt', { session: false }, (err1, callBack) => {
      if (err1) {
        const response = CustomResponse.SERVER_ERROR;
        response.trace = err1;
        res.status(500).json(response);
      }
      if (!callBack) {
        res.status(403).json(CustomResponse.FORBIDDEN);
      } else {
        const eventId = req.params.id;
        if (!eventId) {
          res.status(400).json(CustomResponse.BAD_REQUEST);
        } else {
          Guests.getGuestListInEvent(eventId, (err2, document) => {
            if (err2) {
              const response = CustomResponse.SERVER_ERROR;
              response.trace = err2;
              res.status(500).json(response);
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
        const response = CustomResponse.SERVER_ERROR;
        response.trace = err1;
        res.status(500).json(response);
      }
      if (!callBack) {
        res.status(403).json(CustomResponse.FORBIDDEN);
      } else {
        const { id, name, email, phoneNumber } = req.body;
        if (!name || !email || !id || !phoneNumber) {
          res.status(400).json(CustomResponse.BAD_REQUEST);
        } else {
          const guest = { id, name, email, phoneNumber };
          Guests.editGuest(guest, (err2, document) => {
            if (err2) {
              const response = CustomResponse.SERVER_ERROR;
              response.trace = err2;
              res.status(500).json(response);
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
        const response = CustomResponse.SERVER_ERROR;
        response.trace = err1;
        res.status(500).json(response);
      }
      if (!callBack) {
        res.status(403).json(CustomResponse.FORBIDDEN);
      } else {
        const guestId = req.body;
        if (!guestId) {
          res.status(400).json(CustomResponse.BAD_REQUEST);
        } else {
          Guests.deleteGuestById(guestId, (err2, document) => {
            if (err2) {
              const response = CustomResponse.SERVER_ERROR;
              response.trace = err2;
              res.status(500).json(response);
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
        const response = CustomResponse.SERVER_ERROR;
        response.trace = err1;
        res.status(500).json(response);
      }
      if (!callBack) {
        res.status(403).json(CustomResponse.FORBIDDEN);
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
            const response1 = CustomResponse.SERVER_ERROR;
            response1.trace = err;
            res.status(500).json(response1);
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
        const response = CustomResponse.SERVER_ERROR;
        response.trace = err1;
        res.status(500).json(response);
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
            const response = CustomResponse.SERVER_ERROR;
            response.trace = err;
            res.status(500).json(response);
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
