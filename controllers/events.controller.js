const passport = require('passport');
const Events = require('../models/mEvents');
const Guests = require('../models/mGuests');
const Users = require('../models/mUsers');
const nodeMailer = require('../middlewares/node-mailer');
const NotificationHelper = require('../middlewares/expo-notification');
const CustomResponse = require('../constants/response.message');

module.exports = {
  getEventByID_Guest: async (req, res) => {
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
  getEventByID_Host: async (req, res) => {
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
            } else if (!(String(document.creator) === String(callBack._id))) {
              const response = CustomResponse.ACCESS_DENIED;
              res.status(401).json(response);
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
        let queryParams = null;
        if (req.query._start && req.query._end && req.query._sort && req.query._order && req.query.q) {
          queryParams = {
            start: req.query._start,
            end: req.query._end,
            sort: req.query._sort,
            order: req.query._order,
            q: req.query.q,
          };
        }
        if (queryParams) {
          Events.find({
            $and: [
              { creator: callBack._id },
              {
                $or: [
                  { name: { $regex: queryParams.q, $options: 'i' } },
                  { location: { $regex: queryParams.q, $options: 'i' } },
                ],
              },
            ],
          })
            .sort({ [queryParams.sort]: queryParams.order === 'ASC' ? 1 : -1 })
            .skip(+queryParams.start)
            .limit(+queryParams.end - +queryParams.start)
            .then((eventDocument) => {
              Events.countDocuments(
                {
                  $and: [
                    { creator: callBack._id },
                    {
                      $or: [
                        { name: { $regex: queryParams.q, $options: 'i' } },
                        { location: { $regex: queryParams.q, $options: 'i' } },
                      ],
                    },
                  ],
                },
                (err2, count) => {
                  if (err2) {
                    const response = CustomResponse.SERVER_ERROR;
                    response.trace = err2;
                    res.status(500).json(response);
                  }
                  res.header('Access-Control-Expose-Headers', 'X-Total-Count');
                  res.header('X-Total-Count', count);
                  res.status(200).json({
                    message: {
                      msgBody: 'Get My Attending Event Info Successful!',
                      msgError: false,
                    },
                    data: {
                      events: eventDocument,
                    },
                  });
                },
              );
            })
            .catch((err1) => {
              const response = CustomResponse.SERVER_ERROR;
              response.trace = err1;
              res.status(500).json(response);
            });
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
        let queryParams = null;
        if (req.query._start && req.query._end && req.query._sort && req.query._order && req.query.q) {
          queryParams = {
            start: req.query._start,
            end: req.query._end,
            sort: req.query._sort,
            order: req.query._order,
            q: req.query.q,
          };
        }
        Events.findMyAttendingEvent(callBack.email, queryParams, (err1, eventDocument) => {
          if (err1) {
            const response = CustomResponse.SERVER_ERROR;
            response.trace = err1;
            res.status(500).json(response);
          } else if (queryParams) {
            Events.countMyAttendingEvent(callBack.email, queryParams, (err2, countObj) => {
              if (err2) {
                const response = CustomResponse.SERVER_ERROR;
                response.trace = err2;
                res.status(500).json(response);
              } else {
                res.header('Access-Control-Expose-Headers', 'X-Total-Count');
                res.header('X-Total-Count', countObj[0].attending_event);
                res.status(200).json({
                  message: {
                    msgBody: 'Get My Attending Event Info Successful!',
                    msgError: false,
                  },
                  data: {
                    events: eventDocument,
                  },
                });
              }
            });
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
        Events.getEventById(data.id, (err1, document) => {
          if (err1) {
            const response = CustomResponse.SERVER_ERROR;
            response.trace = err1;
            res.status(500).json(response);
          } else if (document && !(String(document.creator) === String(callBack._id))) {
            const response = CustomResponse.ACCESS_DENIED;
            res.status(401).json(response);
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
            Events.editEvent(data, (err2, eventDocument) => {
              if (err2) {
                const response = CustomResponse.SERVER_ERROR;
                response.trace = err2;
                res.status(500).json(response);
              } else {
                res.status(200).json({
                  message: {
                    msgBody: 'Edit Event Successful!',
                    msgError: false,
                  },
                  eventDocument,
                });
              }
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
        Events.findOne({ _id: id, creator: callBack._id }, 'name description startTime creator')
          .populate('creator')
          .then((event) => {
            // Get all guest's emails of event
            if (event !== null) {
              Guests.find({ event: id, invited: false })
                .select('email _id event')
                .then(async (mails) => {
                  if (mails.length === 0) {
                    res.status(400).json({
                      message: {
                        msgBody: 'No uninvited guests found!',
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
                        Guests.updateInvitationStatus(mails, (err2) => {
                          if (err2) {
                            const response2 = CustomResponse.SERVER_ERROR;
                            response2.trace = err2;
                            res.status(500).json(response2);
                          } else {
                            Users.findExpoTokenByEmail(userEmails, async (err3, userExpo) => {
                              if (err3) {
                                const response3 = CustomResponse.SERVER_ERROR;
                                response3.trace = err3;
                                res.status(500).json(response3);
                              }
                              const userNotifications = userExpo.map((item) => item.expoToken);
                              Users.findOne({ _id: event.creator }).then((host) => {
                                if (host.expoToken) {
                                  NotificationHelper.reminderApplication(
                                    [host.expoToken],
                                    `You have just invited your guests in ${event.name}`,
                                    { eventId: id },
                                    (err4) => {
                                      if (err4) {
                                        throw err4;
                                      }
                                    },
                                  );
                                }
                              });
                              if (userNotifications.length === 0) {
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
                                userNotifications,
                                `You have been invited for ${event.name}`,
                                { eventId: id },
                                (err5) => {
                                  if (err5) {
                                    const response4 = CustomResponse.SERVER_ERROR;
                                    response4.trace = err5;
                                    res.status(500).json(response4);
                                  } else {
                                    // Update guests' status to invited
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
                            });
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
            } else {
              const response = CustomResponse.BAD_REQUEST;
              res.status(400).json(response);
            }
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
