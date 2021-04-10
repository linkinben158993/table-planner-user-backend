const CronJob = require('node-cron');
const Users = require('../models/mUsers');
const Guests = require('../models/mGuests');
const Events = require('../models/mEvents');
const nodeMailer = require('./node-mailer');

module.exports = {
  eventReminder: () => {
    CronJob.schedule(
      '* * * * *',
      async () => {
        // eslint-disable-next-line no-console
        Events.getOneHourLeftEvents((err, document) => {
          if (err) {
            // eslint-disable-next-line no-console
            console.log(err);
          } else if (document.length !== 0) {
            const availableEvent = document.map((item) => {
              Guests.getGuestListInEvent(item._id, async (err1, guestDocument) => {
                if (err1) {
                  throw err1;
                } else {
                  await nodeMailer.eventReminderGuests(guestDocument, item, (err2) => {
                    if (err2) {
                      throw err2;
                    }
                  });
                  Events.findOneAndUpdate(
                    { _id: item._id },
                    { reminded: true },
                    { new: true, returnOriginal: false },
                    (err3) => {
                      if (err3) {
                        throw err3;
                      }
                    },
                  );
                }
              });
              return {
                name: item.name,
                eventId: item._id,
                creator: item.creator,
              };
            });
            const creatorSent = availableEvent.map((item) => {
              Users.findOne({ _id: item.creator }).then((value) => {
                nodeMailer.eventReminderHost(value.email, item.name, (error, info) => {
                  if (error) {
                    throw error;
                  } else {
                    return info;
                  }
                });
              });
              return item.creator;
            });

            // eslint-disable-next-line no-console
            console.log(creatorSent);
          }
          // No event found will be here!
        });
      },
      {
        schedule: true,
        timezone: 'Asia/Ho_Chi_Minh',
      },
    );
  },
};
