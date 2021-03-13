const mongoose = require('mongoose');

const GuestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  phoneNumber: {
    type: String,
  },
  event: {
    type: String,
    required: true,
  },
  table: {
    type: String,
  },
});

GuestSchema.statics.addGuest = function (guest, callBack) {
  const {
 guestName, guestMail, guestPhone, eventId 
} = guest;

  const newGuest = new this({
    name: guestName,
    email: guestMail,
    phoneNumber: guestPhone,
    event: eventId,
    table: 'Unknown',
  });
  return newGuest
    .save()
    .then(() => {
      callBack(null, true);
    })
    .catch((err) => {
      callBack(null, err);
    });
};

// GuestSchema.statics.editGuest = function (guest, callBack) {
//   const { guestName, guestMail, guestPhone } = guest;
//   this.findOne();
// };

module.exports = mongoose.model('Guest', GuestSchema);
