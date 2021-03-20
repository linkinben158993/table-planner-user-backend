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

GuestSchema.statics.addGuest = function (guest, callBack) {
  const { guestName, guestMail, guestPhone, eventId } = guest;

  const newGuest = new this({
    name: guestName,
    email: guestMail,
    phoneNumber: guestPhone,
    priority: '',
    event: eventId,
  });
  return newGuest
    .save()
    .then(() => {
      callBack(null, guest);
    })
    .catch((err) => {
      callBack(null, err);
    });
};

GuestSchema.statics.editGuest = function (guest, callBack) {
  const { guestId, guestName, guestMail, guestPhone } = guest;
  this.findOne({ _id: guestId })
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
          name: guestName,
          email: guestMail,
          phoneNumber: guestPhone,
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

GuestSchema.statics.getGuestListInEvent = function (eventId, callBack) {
  return this.find({
    event: eventId,
  })
    .then((value) => {
      if (value.length === 0) {
        return callBack(null, 0);
      }
      return callBack(null, value);
    })
    .catch((err) => callBack(err));
};

GuestSchema.statics.deleteGuestById = function (guestId, callBack) {
  const { id } = guestId;
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

GuestSchema.statics.assignGuestsToSeats = function (guestSeats, callBack) {
  const bulkOptions = guestSeats.map((guestSeat) => ({
    updateOne: {
      filter: { _id: guestSeat.guestId },
      update: { $set: { table: guestSeat.table }, upsert: true },
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

module.exports = mongoose.model('Guest', GuestSchema);
