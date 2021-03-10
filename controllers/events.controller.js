const Users = require('../models/mUsers');
const Events = require('../models/mEvents');

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
const host = '600ea488f70da93fde2b3acc';

module.exports = {
  // Currently hardcode for default user for convenience change immediately on applying passport
  getAllEvents: async (req, res) => {
    Users.findOne({ _id: host })
      .then((document) => {
        res.status(200).json({ document });
      })
      .catch((err) => {
        res.status(500).json({
          SERVER_ERROR,
          err,
        });
      });
  },
  addNewEvent: async (req, res) => {
    const { eventName, eventDescription, tableType } = req.body;
    // Redefine host with passport jwt
    if (!host || !eventName || !eventDescription || !tableType) {
      res.status(400).json(BAD_REQUEST);
    } else {
      await Events.addEvent(host, eventName, eventDescription, tableType, (err, document) => {
        if (err) {
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
  },
  editEvent: async (req, res) => {
    const { eventId, eventName, eventDescription } = req.body;
    if (!eventId || !eventName || !eventDescription) {
      res.status(400).json(BAD_REQUEST);
    } else {
      await Events.editEvent(eventId, eventName, eventDescription, (err, document) => {
        if (err) {
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
  },
};
