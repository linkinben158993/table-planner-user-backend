const passport = require('passport');
const Events = require('../models/mEvents');
const Guests = require('../models/mGuests');
const Users = require('../models/mUsers');
const nodeMailer = require('../middlewares/node-mailer');
const NotificationHelper = require('../middlewares/expo-notification');
const CustomResponse = require('../constants/response.message');

// an@gmail.com 123456
// const host = '600ea488f70da93fde2b3acc';

module.exports = {
  getEventByID: async (req, res) => {
    passport.authenticate('jwt', { session: false }, (err, callBack) => {
      if (err) {
        res.status(500).json(err);
      }
      if (!callBack) {
        res.status(403).json('Forbidden');
      } else {
        const { id } = req.params;
        if (!id) {
          res.status(400).json(CustomResponse.BAD_REQUEST);
        } else {
          Events.getEventById(id, (err1, document) => {
            if (err1) {
              const response = CustomResponse.SERVER_ERROR;
              response.trace = err1;
              res.status(500).json(response);
            } else if (document.elements) {
              Guests.getGuestListHaveSeatInEvent(document._id, (err2, guests) => {
                if (err2) {
                  const response = CustomResponse.SERVER_ERROR;
                  response.trace = err2;
                  res.status(500).json(response);
                }
                const elements = JSON.parse(document.elements);
                elements
                  .filter((el) => {
                    if (el.data) {
                      return !!el.data.guestList;
                    }
                    return false;
                  })
                  .forEach((el) => {
                    if (el.data.guestList.length > 0) el.data.guestList = [];
                    guests.forEach((guest) => {
                      if (guest.table.tableId === el.id) {
                        el.data.guestList.push(guest);
                      }
                    });
                  });
                document.elements = JSON.stringify(elements);
                res.status(200).json({
                  message: {
                    msgBody: 'Get Event Successful!',
                    msgError: false,
                  },
                  data: document,
                });
              });
            } else {
              res.status(200).json({
                message: {
                  msgBody: 'Get Event Successful!',
                  msgError: false,
                },
                data: document,
              });
            }
          });
        }
      }
    })(req, res);
  },
  getAllEvents: async (req, res) => {
    passport.authenticate('jwt', { session: false }, (err, callBack) => {
      if (err) {
        const response = CustomResponse.SERVER_ERROR;
        response.trace = err;
        res.status(500).json(response);
      }
      if (!callBack) {
        res.status(403).json(CustomResponse.FORBIDDEN);
      } else {
        Events.find({ creator: callBack._id })
          .then((document) => {
            res.status(200).json({ document });
          })
          .catch((err1) => {
            const response = CustomResponse.SERVER_ERROR;
            response.trace = err1;
            res.status(500).json(response);
          });
      }
    })(req, res);
  },
  getMyAttendingEvents: (req, res) => {
    passport.authenticate('jwt', { session: false }, (err, callBack) => {
      if (err) {
        const response = CustomResponse.SERVER_ERROR;
        response.trace = err;
        res.status(500).json(response);
      }
      if (!callBack) {
        res.status(403).json(CustomResponse.FORBIDDEN);
      } else {
        Events.findMyAttendingEvent(callBack.email, (err1, eventDocument) => {
          if (err1) {
            const response = CustomResponse.SERVER_ERROR;
            response.trace = err1;
            res.status(500).json(response);
          } else if (eventDocument.length > 0) {
            res.status(200).json({
              message: {
                msgBody: 'Get My Attending Event Info Successful!',
                msgError: false,
              },
              data: eventDocument,
            });
          } else {
            res.status(200).json({
              message: {
                msgBody: "You Haven't Had Any Event!",
                msgError: false,
              },
              data: [],
            });
          }
        });
      }
    })(req, res);
  },
  addNewEvent: async (req, res) => {
    passport.authenticate('jwt', { session: false }, (err, callBack) => {
      if (err) {
        const response = CustomResponse.SERVER_ERROR;
        response.trace = err;
        res.status(500).json(response);
      }
      if (!callBack) {
        res.status(403).json(CustomResponse.FORBIDDEN);
      } else {
        const { name, description, startTime, endTime, location } = req.body;
        // Redefine host with passport jwt
        if (!name || !description) {
          res.status(400).json(CustomResponse.BAD_REQUEST);
        } else {
          const { _id } = callBack;
          const newEvent = {
            name,
            description,
            startTime,
            endTime,
            location,
          };
          Events.addEvent(_id, newEvent, (err1, document) => {
            if (err1) {
              const response = CustomResponse.SERVER_ERROR;
              response.trace = err1;
              res.status(500).json(response);
            } else {
              res.status(200).json({
                message: {
                  msgBody: 'Add New Event Successful!',
                  msgError: false,
                },
                data: document,
              });
            }
          });
        }
      }
    })(req, res);
  },
  editEvent: async (req, res) => {
    passport.authenticate('jwt', { session: false }, (err, callBack) => {
      const data = req.body;
      if (err) {
        const response = CustomResponse.SERVER_ERROR;
        response.trace = err;
        res.status(500).json(response);
      }
      if (!data.id && !data.elements) {
        res.status(400).json(CustomResponse.BAD_REQUEST);
      } else if (!callBack) {
        res.status(403).json(CustomResponse.FORBIDDEN);
      } else {
        if (data.elements) {
          const elements = JSON.parse(data.elements);
          const guests = [];
          elements
            .filter((el) => {
              if (el.data) {
                return !!el.data.guestList;
              }
              return false;
            })
            .forEach((el) => {
              if (el.data.guestList) {
                el.data.guestList.forEach((guest, i) => {
                  if (!guest.table.tableId) {
                    guest.table = {
                      tableId: el.id,
                      seat: i,
                    };
                  }
                  // eslint-disable-next-line no-param-reassign
                  guests.push(guest);
                });
                // eslint-disable-next-line no-param-reassign
                el.data.guestList = [];
              }
            });
          data.elements = JSON.stringify(elements);
          Guests.updateGuestList(guests, (errGuest) => {
            if (err) {
              const response = CustomResponse.SERVER_ERROR;
              response.trace = errGuest;
              res.status(500).json(response);
            }
          });
        }
        Events.editEvent(data, (err1, document) => {
          if (err1) {
            const response = CustomResponse.SERVER_ERROR;
            response.trace = err1;
            res.status(500).json(response);
          } else {
            res.status(200).json({
              message: {
                msgBody: 'Edit Event Successful!',
                msgError: false,
              },
              document,
            });
          }
        });
      }
    })(req, res);
  },
  sendMailToAllGuest: async (req, res) => {
    passport.authenticate('jwt', { session: false }, (err, callBack) => {
      const { id } = req.body;
      if (err) {
        const response = CustomResponse.SERVER_ERROR;
        response.trace = err;
        res.status(500).json(response);
      }
      if (!id) {
        res.status(400).json(CustomResponse.BAD_REQUEST);
      } else if (!callBack) {
        res.status(403).json(CustomResponse.FORBIDDEN);
      } else {
        Events.findOne({ _id: id }, 'name description startTime creator')
          .populate('creator')
          .then((event) => {
            // Get all guest's emails of event
            Guests.find({ event: id })
              .select('email _id')
              .then(async (mails) => {
                if (mails.length === 0) {
                  res.status(400).json({
                    message: {
                      msgBody: 'No guests found!',
                      msgError: true,
                    },
                  });
                } else {
                  await nodeMailer.sendQRCodeToGuests(mails, event, (err1) => {
                    if (err1) {
                      const response1 = CustomResponse.SERVER_ERROR;
                      response1.trace = err1;
                      res.status(500).json(response1);
                    } else {
                      const userEmails = mails.map((item) => item.email);
                      Users.findUserWithExpoTokenByEmail(userEmails, async (err2, userDocument) => {
                        if (err2) {
                          const response2 = CustomResponse.SERVER_ERROR;
                          response2.trace = err2;
                          res.status(500).json(response2);
                        } else {
                          const pushNotificationUser = userDocument.map((item) => item.expoToken);
                          if (pushNotificationUser.length === 0) {
                            res.status(200).json({
                              message: {
                                msgBody: 'Send invitation success!',
                                msgError: false,
                              },
                              trace: {
                                msgBody: 'No guest using application found!',
                                msgError: false,
                              },
                            });
                          }
                          await NotificationHelper.reminderApplication(
                            pushNotificationUser,
                            `You have been invited for ${event.name}`,
                            (err3) => {
                              if (err3) {
                                const response3 = CustomResponse.SERVER_ERROR;
                                response3.trace = err3;
                                res.status(500).json(response3);
                              } else {
                                const successResponse = {
                                  message: {
                                    msgBody: 'Send invitation success!',
                                    msgError: false,
                                  },
                                };
                                res.status(200).json(successResponse);
                              }
                            },
                          );
                        }
                      });
                    }
                  });
                }
              })
              .catch((err1) => {
                const response = CustomResponse.SERVER_ERROR;
                response.trace = err1;
                res.status(500).json(response);
              });
          })
          .catch((err1) => {
            const response = CustomResponse.SERVER_ERROR;
            response.trace = err1;
            res.status(500).json(response);
          });
      }
    })(req, res);
  },
};
