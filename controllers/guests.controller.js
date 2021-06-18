const Guests = require('../models/mGuests');
const CustomResponse = require('../constants/response.message');

module.exports = {
  getGuestList: async (req, res) => {
    const eventId = req.params.id;
    if (!eventId) {
      res.status(400).json(CustomResponse.BAD_REQUEST);
    } else {
      let queryParams = null;
      if (req.query._start && req.query._end && req.query._sort && req.query._order && req.query.q) {
        queryParams = {
          start: req.query._start,
          end: req.query._end,
          sort: req.query._sort,
          order: req.query._order,
          q: req.query.q,
        };
      }
      Guests.getGuestListInEvent(eventId, queryParams, (err2, document) => {
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
  },

  editGuest: async (req, res) => {
    const data = req.body;
    if (!data.id) {
      res.status(400).json(CustomResponse.BAD_REQUEST);
    } else {
      await Guests.editGuest(data, (err1, document) => {
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
  },

  deleteGuest: async (req, res) => {
    const guestId = req.body;
    const { id } = guestId;
    if (!id) {
      res.status(400).json(CustomResponse.BAD_REQUEST);
    } else {
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
  },
  importGuests: async (req, res) => {
    const temp = req.body;
    const duplicateEmails = temp.reduce(
      (dEmails, current) => {
        if (dEmails[0].some((el) => el === current.email)) {
          if (!dEmails[1].some((el) => el === current.email)) {
            dEmails[1] = [...dEmails[1], current.email];
          }
        } else {
          dEmails[0] = [...dEmails[0], current.email];
        }
        return dEmails;
      },
      [[], []],
    );
    if (duplicateEmails[1].length > 0) {
      res.status(400).json({
        errMsg: 'Duplicate emails in input file',
        duplicateEmails: duplicateEmails[1],
      });
    } else {
      const guests = temp.map((element) => ({
        name: element.name,
        email: element.email,
        phoneNumber: element.phoneNumber,
        priority: element.priority,
        invited: false,
        event: element.eventId,
        table: element.table,
        group: element.group,
      }));
      Guests.importGuestsToEvent(guests, (err, response) => {
        if (err) {
          if (err.message.msgBody === 'Duplicate email') {
            res.status(400).json(err);
          } else {
            const response1 = CustomResponse.SERVER_ERROR;
            response1.trace = err;
            res.status(500).json(response1);
          }
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
  },
  updateGuestList: async (req, res) => {
    const temp = req.body;
    const guests = temp.map((element) => ({
      name: element.name,
      email: element.email,
      phoneNumber: element.phoneNumber,
      priority: element.priority,
      event: element.event,
      table: element.table,
      group: element.group,
    }));
    await Guests.updateGuestList(guests, (err, response) => {
      if (err) {
        const response1 = CustomResponse.SERVER_ERROR;
        response1.trace = err;
        res.status(500).json(response1);
      } else {
        res.status(200).json({
          message: {
            msgBody: 'Update Guest List Successful!',
            msgError: false,
          },
          response,
        });
      }
    });
  },
  assignTable: async (req, res) => {
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
  },
  setPriorityGuest: async (req, res) => {
    const { id, priority } = req.body;
    if (!id || !priority) {
      res.status(400).json(CustomResponse.BAD_REQUEST);
    } else {
      const guest = {
        id,
        priority,
      };
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
  },
  checkin: async (req, res) => {
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
  },
};
