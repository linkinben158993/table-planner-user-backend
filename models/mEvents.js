const mongoose = require('mongoose');
const Users = require('./mUsers');

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  tables: [
    {
      id: {
        type: String,
      },
      type: {
        type: String,
      },
      position: {
        x: {
          type: Number,
        },
        y: {
          type: Number,
        },
      },
      data: {
        label: {
          type: String,
          required: true,
        },
        guests: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Guest',
          },
        ],
      },
    },
  ],
});

// Add new event and which user is its host
EventSchema.statics.addEvent = function (userId, event, callBack) {
  const { eventName, eventDescription, tableType } = event;
  const newEvent = new this({
    name: eventName,
    description: eventDescription,
    startTime: Date.now(),
    tables: {
      tableType,
      elements: [],
    },
  });
  newEvent
    .save()
    .then(() => {
      Users.findOne({ _id: userId })
        .then((document) => {
          if (!document) {
            callBack(
              {
                message: {
                  msgBody: 'No document found!',
                  msgError: true,
                },
              },
              null,
            );
          } else {
            document.myEvents.push(newEvent);
            document
              .save()
              .then(() => {
                callBack(null, true);
              })
              .catch((err) => {
                callBack(null, err);
              });
          }
        })
        .catch((err) => {
          callBack(null, err);
        });
    })
    .catch((err) => callBack(null, err));
};

EventSchema.statics.editEvent = function (host, event, callBack) {
  const { eventId, eventName, eventDescription } = event;
  this.findOne({ _id: eventId })
    .then((document) => {
      if (!document) {
        callBack(
          {
            message: {
              msgBody: 'No event found!',
              msgError: true,
            },
          },
          null,
        );
      } else {
        document.set({
          name: eventName,
          description: eventDescription,
        });
        document
          .save()
          .then((response) => {
            callBack(null, response);
          })
          .catch((err) => callBack(null, err));
      }
    })
    .catch((err) => callBack(null, err));
};

module.exports = mongoose.model('Event', EventSchema);
