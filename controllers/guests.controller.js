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
    passport.authenticate('jwt', { session: false }, (err, callBack) => {
      const data = req.body;
      if (err) {
        const response = CustomResponse.SERVER_ERROR;
        response.trace = err;
        res.status(500).json(response);
      }
      if (!data.id) {
        res.status(400).json(CustomResponse.BAD_REQUEST);
      } else if (!callBack) {
        res.status(403).json(CustomResponse.FORBIDDEN);
      } else {
        Guests.editGuest(data, (err1, document) => {
          if (err1) {
            const response = CustomResponse.SERVER_ERROR;
            response.trace = err1;
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
          const { id } = guestId;
          Guests.deleteGuestById(id, (err2, document) => {
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
          const { name, email, phoneNumber, priority, eventId, table, group } = element;
          const guest = {
            name,
            email,
            phoneNumber,
            priority,
            event: eventId,
            table,
            group,
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
        const guestList = req.body;
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

  setPriorityGuest: async (req, res) => {
    passport.authenticate('jwt', { session: false }, (err1, callBack) => {
      if (err1) {
        const response = CustomResponse.SERVER_ERROR;
        response.trace = err1;
        res.status(500).json(response);
      }
      if (!callBack) {
        res.status(403).json(CustomResponse.FORBIDDEN);
      } else {
        const { id, priority } = req.body;
        if (!id || !priority) {
          res.status(400).json(CustomResponse.BAD_REQUEST);
        } else {
          const guest = { id, priority };
          Guests.setPriority(guest, (err2, document) => {
            if (err2) {
              const response = CustomResponse.SERVER_ERROR;
              response.trace = err2;
              res.status(500).json(response);
            } else {
              res.status(200).json({
                message: {
                  msgBody: 'Set Guest Priority Successful!',
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

  checkin: async (req, res) => {
    passport.authenticate('jwt', { session: false }, (err1, callBack) => {
      if (err1) {
        const response = CustomResponse.SERVER_ERROR;
        response.trace = err1;
        res.status(500).json(response);
      }
      if (!callBack) {
        res.status(403).json(CustomResponse.FORBIDDEN);
      } else {
        const { id } = req.body;
        if (!id) {
          res.status(400).json(CustomResponse.BAD_REQUEST);
        } else {
          const guest = { id };
          Guests.checkin(guest, (err2, document) => {
            if (err2) {
              const response = CustomResponse.SERVER_ERROR;
              response.trace = err2;
              res.status(500).json(response);
            } else {
              res.status(200).json({
                message: {
                  msgBody: 'Checkin Successful!',
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
