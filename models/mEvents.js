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
    default: null,
  },
});

EventSchema.statics.getEventById = function (eventId, callBack) {
  this.findOne({ _id: eventId })
    .then((value) => {
      if (!value) {
        callBack({
          message: {
            msgBody: 'No document found!',
            msgError: true,
          },
        });
      } else {
        Guests.getGuestListInEvent(eventId, (err2, document) => {
          if (err2) {
            callBack(err2);
          } else {
            callBack(null, document);
          }
        });
      }
    })
    .catch((err) => {
      callBack(err);
    });
};

// Add new event and which user is its host
EventSchema.statics.addEvent = function (userId, event, callBack) {
  const { name, description } = event;
  const newEvent = new this({
    name,
    description,
  });
  Users.findOne({ _id: userId })
    .then((document) => {
      if (!document) {
        callBack({
          message: {
            msgBody: 'No document found!',
            msgError: true,
          },
        });
      } else {
        newEvent.set({ creator: document._id });
        document.myEvents.push(newEvent);
        newEvent
          .save()
          .then(() => {
            document
              .save()
              .then(() => {
                callBack(null, newEvent);
              })
              .catch((err) => {
                callBack(err);
              });
          })
          .catch((err) => callBack(err));
      }
    })
    .catch((err) => {
      callBack(err);
    });
};

EventSchema.statics.editEvent = function (event, callBack) {
  this.update({ _id: event.id }, event, (err, document) => {
    if (err) {
      callBack(err);
    } else {
      callBack(null, document);
    }
  });
};

EventSchema.set('toObject', { getters: true });
EventSchema.set('toJSON', { getters: true });

module.exports = mongoose.model('Event', EventSchema);
