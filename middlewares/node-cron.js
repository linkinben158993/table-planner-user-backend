const CronJob = require('node-cron');
const Users = require('../models/mUsers');
const Guests = require('../models/mGuests');
const Events = require('../models/mEvents');
const nodeMailer = require('./node-mailer');
const NotificationHelper = require('./expo-notification');

module.exports = {
  eventReminder: (remindedType) => {
    CronJob.schedule(
      '*/5 * * * *',
      async () => {
        Events.getOneHourLeftEvents(remindedType, (err, document) => {
          if (err) {
            // eslint-disable-next-line no-console
            console.log(err);
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
                    Events.findOneAndUpdate(
                      { _id: item._id },
                      { reminded: true },
                      {
                        new: true,
                        returnOriginal: false,
                      },
                      (err3) => {
                        if (err3) {
                          throw err3;
                        }
                      }
                    );
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
  eventReminderApp: async (remindedType) => {
    CronJob.schedule(
      '*/5 * * * *',
      async () => {
        Events.getOneHourLeftEvents(remindedType, async (err, document) => {
          if (err) {
            console.log(err);
          } else {
            document.forEach((item) => {
              Guests.getGuestListInEvent(item._id, (err1, guestDocument) => {
                if (guestDocument.length > 0) {
                  const emails = guestDocument.map(
                    (guestEmails) => guestEmails.email
                  );
                  Users.findUserWithExpoTokenByEmail(
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
                        (err3, response) => {
                          if (err3) {
                            console.log(err3);
                          }
                          console.log(response);
                        }
                      );
                    }
                  );
                }
              });
              item.set({ remindedApp: true });
              item.save().catch((reason) => console.log(reason));
            });
          }
        });
      },
      {
        schedule: true,
        timezone: 'Asia/Ho_Chi_Minh',
      }
    );
  },
  pushNotification: (socket) => {
    CronJob.schedule(
      '* * * * *',
      () => {
        socket.emit('test-cron-emit', {
          message: {
            msgBody: 'Hello from cron',
            msgError: false,
            now: Date.now(),
          },
        });
      },
      {
        schedule: true,
        timezone: 'Asia/Ho_Chi_Minh',
      }
    );
  },
};
