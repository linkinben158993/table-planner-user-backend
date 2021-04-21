const mongoose = require('mongoose');
const Users = require('./mUsers');

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
  invited: {
    type: Boolean,
    default: false,
  },
  checkin: {
    type: Date,
    default: null,
  },
  table: {
    tableId: {
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

GuestSchema.statics.getGuestListInEvent = function (eventId, callBack) {
  return this.find({
    event: eventId,
  })
    .then((guestValue) => {
      if (guestValue.length === 0) {
        return callBack(null, 0);
      }
      const emails = guestValue.map((item) => item.email);
      return Users.find({ email: { $in: emails } })
        .then((users) => {
          if (users.length === 0) {
            return callBack(null, guestValue);
          }
          const userEmails = users.map((userItem) => userItem.email);
          const guestWithAvt = guestValue.map((guestItem) => {
            const userIndex = userEmails.indexOf(guestItem.email);
            const { id, email, event, name, checkin, group, priority, table } = guestItem;
            if (userIndex !== -1) {
              return {
                id,
                email,
                event,
                name,
                checkin,
                group,
                priority,
                table,
                avatar: users[userIndex].avatar,
              };
            }
            return {
              id,
              email,
              event,
              name,
              checkin,
              group,
              priority,
              table,
              avatar: '',
            };
          });
          return callBack(null, guestWithAvt);
        })
        .catch((err) => {
          callBack(err);
        });
    })
    .catch((err) => {
      callBack(err);
    });
};

GuestSchema.statics.getGuestListHaveSeatInEvent = function (id, callBack) {
  return this.find({
    event: id,
    'table.tableId': { $ne: null },
  })
    .then((value) => {
      if (value.length === 0) {
        return callBack(null, []);
      }
      return callBack(null, value);
    })
    .catch((err) => callBack(err));
};

GuestSchema.statics.getInvitedGuestListInEvent = function (id, callBack) {
  return this.find({
    event: id,
    invited: true,
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
        this.deleteOne({ _id: id })
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
  const emails = guests.map((guest) => guest.email);
  // eslint-disable-next-line no-use-before-define
  Guest.find({ email: { $in: emails }, event: guests[0].event })
    .select('email')
    .then((results) => {
      if (results.length > 0) {
        callBack({
          message: {
            msgBody: 'Duplicate email',
            msgError: true,
            body: results,
          },
        });
      } else {
        this.insertMany(guests)
          .then((guestsAdded) => {
            callBack(null, guestsAdded);
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

GuestSchema.statics.updateGuestList = function (guests, callBack) {
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

GuestSchema.statics.updateInvitationStatus = function (guests, callBack) {
  const bulkOptions = guests.map((guest) => ({
    updateOne: {
      filter: { email: guest.email, event: guest.event },
      update: {
        $set: {
          invited: true,
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
    .catch((err) => callBack(err));
};

GuestSchema.set('toObject', { getters: true });
GuestSchema.set('toJSON', { getters: true });

const Guest = mongoose.model('Guest', GuestSchema);

module.exports = Guest;
