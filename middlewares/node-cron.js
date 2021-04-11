const CronJob = require('node-cron');
const Users = require('../models/mUsers');
const Guests = require('../models/mGuests');
const Events = require('../models/mEvents');
const nodeMailer = require('./node-mailer');
const NotificationHelper = require('./expo-notification');

module.exports = {
  eventReminder: () => {
    CronJob.schedule(
      '*/5 * * * *',
      async () => {
        Events.getOneHourLeftEvents((err, document) => {
          if (err) {
            throw err;
          } else if (document.length !== 0) {
            const availableEvent = document.map((item) => {
              Guests.getGuestListInEvent(
                item._id,
                async (err1, guestDocument) => {
                  if (err1) {
                    throw err1;
                  } else {
                    await nodeMailer.eventReminderGuests(
                      guestDocument,
                      item,
                      (err2) => {
                        if (err2) {
                          throw err2;
                        }
                      }
                    );
                    const emails = guestDocument.map(
                      (guestEmails) => guestEmails.email
                    );
                    await Users.findUserWithExpoTokenByEmail(
                      emails,
                      async (err2, userDocument) => {
                        if (err2) {
                          console.log(err2);
                        }
                        const pushNotificationUser = userDocument.map(
                          (userItem) => userItem.expoToken
                        );
                        await NotificationHelper.reminderApplication(
                          pushNotificationUser,
                          `It is almost time for ${item.name}`,
                          (err3) => {
                            if (err3) {
                              throw err3;
                            }
                          }
                        );
                      }
                    );
                    item.set({ reminded: true });
                    item.save().catch((reason) => console.log(reason));
                  }
                }
              );
              return {
                name: item.name,
                eventId: item._id,
                creator: item.creator,
              };
            });
            const creatorSent = availableEvent.map((item) => {
              Users.findOne({ _id: item.creator }).then((value) => {
                nodeMailer.eventReminderHost(
                  value.email,
                  item.name,
                  (error, info) => {
                    if (error) {
                      throw error;
                    } else {
                      return info;
                    }
                  }
                );
              });
              return item.creator;
            });

            console.log(creatorSent);
          }
          // No event found will be here!
        });
      },
      {
        schedule: true,
        timezone: 'Asia/Ho_Chi_Minh',
      }
    );
  },
};
