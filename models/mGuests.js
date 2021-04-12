const mongoose = require('mongoose');

const GuestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    require: true,
  },
  phoneNumber: {
    type: String,
  },
  priority: {
    type: Number,
    default: -1,
  },
  group: {
    type: String,
    default: '',
  },
  event: {
    type: String,
    required: true,
  },
  checkin: {
    type: Date,
    default: null,
  },
  table: {
    id: {
      type: String,
      default: null,
    },
    seat: {
      type: Number,
      default: null,
    },
  },
});

GuestSchema.statics.editGuest = function (guest, callBack) {
  this.findOne({ _id: guest.id })
    .then((document) => {
      if (!document) {
        callBack({
          message: {
            msgBody: 'Can not found guest!',
            msgError: true,
          },
        });
      } else {
        this.update({ _id: guest.id }, guest, (err, doc) => {
          if (err) {
            callBack(err);
          } else {
            callBack(null, doc);
          }
        });
      }
    })
    .catch((err) => callBack(err));
};

GuestSchema.statics.getGuestListInEvent = function (id, callBack) {
  return this.find({
    event: id,
  })
    .then((value) => {
      if (value.length === 0) {
        return callBack(null, 0);
      }
      return callBack(null, value);
    })
    .catch((err) => callBack(err));
};

GuestSchema.statics.getGuestListHaveSeatInEvent = function (id, callBack) {
  return this.find({
    event: id,
    table: { $ne: null },
  })
    .then((value) => {
      if (value.length === 0) {
        return callBack(null, []);
      }
      return callBack(null, value);
    })
    .catch((err) => callBack(err));
};

GuestSchema.statics.deleteGuestById = function (id, callBack) {
  this.findOne({ _id: id })
    .then((document) => {
      if (!document) {
        callBack(
          {
            message: {
              msgBody: 'Can not found guest',
              msgError: true,
            },
          },
          null,
        );
      } else {
        document
          .deleteOne({ _id: id })
          .then((response) => {
            callBack(null, response);
          })
          .catch((err) => {
            callBack(err);
          });
      }
    })
    .catch((err) => {
      callBack(err);
    });
};

GuestSchema.statics.importGuestsToEvent = function (guests, callBack) {
  const bulkOptions = guests.map((guest) => ({
    updateOne: {
      filter: { email: guest.email, event: guest.event },
      update: {
        $set: {
          phoneNumber: guest.phoneNumber,
          name: guest.name,
          priority: guest.priority,
          table: guest.table,
          group: guest.group,
        },
        upsert: true,
      },
      upsert: true,
    },
  }));

  this.bulkWrite(bulkOptions)
    .then((response) => {
      callBack(null, response);
    })
    .catch((err) => {
      callBack(err);
    });
};

GuestSchema.statics.assignGuestsToSeats = function (seats, callBack) {
  const bulkOptions = seats.map((seat) => ({
    updateOne: {
      filter: { _id: seat.id },
      update: { $set: { table: seat.table }, upsert: true },
    },
  }));

  this.bulkWrite(bulkOptions)
    .then((response) => {
      callBack(null, response);
    })
    .catch((err) => {
      callBack(err);
    });
};

GuestSchema.statics.setPriority = function (guest, callBack) {
  const { id, priority } = guest;
  this.findOne({ _id: id })
    .then((document) => {
      if (!document) {
        callBack({
          message: {
            msgBody: 'Can not found guest!',
            msgError: true,
          },
        });
      } else {
        document.set({
          priority,
        });
        document
          .save()
          .then((response) => {
            callBack(null, response);
          })
          .catch((err) => callBack(err));
      }
    })
    .catch((err) => callBack(err));
};

GuestSchema.statics.checkin = function (data, callBack) {
  const { id, eventId } = data;
  this.findOne({ _id: id, event: eventId })
    .then((document) => {
      if (!document) {
        callBack({
          message: {
            msgBody: 'Can not found guest!',
            msgError: true,
          },
        });
      } else if (document.checkin) {
        callBack({
          message: {
            msgBody: 'Guest checked in before!!!',
            msgError: true,
          },
        });
      } else {
        document.set({
          checkin: new Date(),
        });
        document
          .save()
          .then((response) => {
            callBack(null, response);
          })
          .catch((err) => callBack(err));
      }
    })
    .catch((err) => callBack(err));
};

GuestSchema.set('toObject', { getters: true });
GuestSchema.set('toJSON', { getters: true });

module.exports = mongoose.model('Guest', GuestSchema);
