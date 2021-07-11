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
              Guests.getInvitedGuestListInEvent(
                item._id,
                async (err1, guestDocument) => {
                  if (err1) {
                    throw err1;
                  } else {
                    // Remind guest
                    if (guestDocument !== 0 && !item.reminded) {
                      await nodeMailer.eventReminderGuests(
                        guestDocument,
                        item,
                        (err2) => {
                          if (err2) {
                            throw err2;
                          }
                        }
                      );
                      console.log(guestDocument);
                      const guestInfos = guestDocument.map((item) => {
                        return {
                          email: item.email,
                          guestId: item._id,
                        };
                      });
                      await Users.findExpoTokenByEmail(
                        guestInfos,
                        async (err2, userDocument) => {
                          if (err2) {
                            console.log(err2);
                          }
                          const pushNotificationUser = userDocument.map(
                            (userItem) => {
                              const guestId = guestInfos
                                .map((item) => item.email)
                                .indexOf(userItem.email);
                              return {
                                expoToken: userItem.expoToken,
                                guestId: guestInfos[guestId].guestId,
                              };
                            }
                          );
                          console.log(pushNotificationUser);
                          await NotificationHelper.reminderApplication(
                            pushNotificationUser,
                            `It is almost time for ${item.name}`,
                            { eventId: item._id },
                            (err3) => {
                              if (err3) {
                                throw err3;
                              }
                            }
                          );
                        }
                      );
                    }
                    Events.findOneAndUpdate(
                      { _id: item._id },
                      { reminded: true }
                    ).catch((reason) => {
                      console.log(reason);
                    });
                  }
                }
              );

              // Remind host
              if (!item.remindedHost) {
                Users.findOne({ _id: item.creator }).then(async (value) => {
                  await nodeMailer.eventReminderHost(
                    value.email,
                    item,
                    (error, info) => {
                      if (error) {
                        throw error;
                      } else {
                        return info;
                      }
                    }
                  );
                  // Remind host application
                  if (value.expoToken) {
                    await NotificationHelper.reminderApplication(
                      [
                        {
                          expoToken: value.expoToken,
                        },
                      ],
                      `Your hosting event ${item.name} is coming soon.`,
                      { eventId: item._id },
                      (err3) => {
                        if (err3) {
                          throw err3;
                        }
                      }
                    );
                  }
                });
                Events.findOneAndUpdate(
                  { _id: item._id },
                  { remindedHost: true }
                ).catch((reason2) => {
                  console.log(reason2);
                });
              }

              return {
                name: item.name,
                eventId: item._id,
                creator: item.creator,
              };
            });

            console.log(availableEvent);
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
