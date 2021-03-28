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
  event: {
    type: String,
    required: true,
  },
  table: {
    id: {
      type: String,
      default: null,
    },
    seatNo: {
      type: Number,
      default: null,
    },
  },
});

GuestSchema.statics.editGuest = function (guest, callBack) {
  const { id, name, email, phoneNumber } = guest;
  this.findOne({ _id: id })
    .then((document) => {
      if (!document) {
        callBack(
          {
            message: {
              msgBody: 'Can not found guest!',
              msgError: true,
            },
          },
          null,
        );
      } else {
        document.set({
          name,
          email,
          phoneNumber,
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
      filter: { _id: seat.guestId },
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

GuestSchema.set('toObject', { getters: true });
GuestSchema.set('toJSON', { getters: true });

module.exports = mongoose.model('Guest', GuestSchema);
