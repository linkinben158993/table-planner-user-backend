const mongoose = require('mongoose');
const Users = require('./mUsers');
const Guests = require('./mGuests');

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
  endTime: {
    type: Date,
    default: new Date(+new Date() + 7 * 24 * 60 * 60 * 1000),
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  elements: {
    type: String,
  },
});

EventSchema.statics.getEventById = function (eventId, callBack) {
  this.findOne({ _id: eventId }).then((value) => {
    if (!value) {
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
      Guests.getGuestListInEvent(eventId, (err2, document) => {
        if (err2) {
          callBack(err2);
        } else {
          callBack(null, {
            message: {
              msgBody: 'Get event successful',
              msgError: true,
            },
            data: { event: value, guests: document },
          });
        }
      });
    }
  });
};

// Add new event and which user is its host
EventSchema.statics.addEvent = function (userId, event, callBack) {
  const { eventName, eventDescription } = event;
  const newEvent = new this({
    name: eventName,
    description: eventDescription,
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
                callBack(null, newEvent);
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
