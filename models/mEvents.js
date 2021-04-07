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
  endTime: {
    type: Date,
    default: new Date(+new Date() + 7 * 24 * 60 * 60 * 1000),
  },
  location: {
    type: String,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  elements: {
    type: String,
    default: null,
  },
  urls: [
    {
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
    },
  ],
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
        callBack(null, value);
      }
    })
    .catch((err) => {
      callBack(err);
    });
};

// Add new event and which user is its host
EventSchema.statics.addEvent = function (userId, event, callBack) {
  const { name, description, startTime, endTime, location } = event;
  const newEvent = new this({
    name,
    description,
    startTime,
    endTime,
    location,
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

EventSchema.statics.removeImages = function (event, publicId, callBack) {
  this.update(
    { _id: event },
    {
      $pull: {
        urls: {
          publicId,
        },
      },
    },
    (err, document) => {
      if (err) {
        callBack(err);
      } else {
        callBack(null, document);
      }
    },
  );
};

EventSchema.set('toObject', { getters: true });
EventSchema.set('toJSON', { getters: true });

module.exports = mongoose.model('Event', EventSchema);
