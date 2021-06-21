const mongoose = require('mongoose');
const Users = require('./mUsers');

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
    default: new Date(+new Date() + 7 * 24 * 60 * 60 * 1000),
  },
  location: {
    type: String,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  elements: {
    type: String,
    default: null,
  },
  urls: [
    {
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
    },
  ],
  reminded: {
    type: Boolean,
    default: false,
  },
  remindedHost: {
    type: Boolean,
    default: false,
  },
});

EventSchema.statics.getEventById = function (eventId, callBack) {
  this.findOne({ _id: eventId })
    .then((value) => {
      if (!value) {
        callBack({
          message: {
            msgBody: 'No document found!',
            msgError: true,
          },
        });
      } else {
        callBack(null, value);
      }
    })
    .catch((err) => {
      callBack(err);
    });
};

EventSchema.statics.removeEvent = function (userId, event, callBack) {
  this.deleteOne({
    _id: event,
    creator: userId,
  })
    .then((document) => {
      callBack(null, document);
    })
    .catch((error) => {
      callBack(error);
    });
};

// Add new event and which user is its host
EventSchema.statics.addEvent = function (userId, event, callBack) {
  const { name, description, startTime, endTime, location } = event;
  const newEvent = new this({
    name,
    description,
    startTime,
    endTime,
    location,
    reminded: false,
    remindedHost: false,
  });
  Users.findOne({ _id: userId })
    .then((document) => {
      if (!document) {
        callBack({
          message: {
            msgBody: 'No document found!',
            msgError: true,
          },
        });
      } else {
        newEvent.set({ creator: document._id });
        newEvent
          .save()
          .then(() => {
            callBack(null, newEvent);
          })
          .catch((err) => callBack(err));
      }
    })
    .catch((err) => {
      callBack(err);
    });
};

EventSchema.statics.editEvent = function (event, callBack) {
  this.findOne({ _id: event.id })
    .then((value) => {
      if (!value) {
        callBack({
          message: {
            msgBody: 'No document found!',
            msgError: true,
          },
        });
      } else {
        if (value.urls.length !== 0 && event.urls) {
          const { urls } = value;
          const urlsUpdate = urls.map((item) => ({
            url: item.url,
            publicId: item.publicId,
          }));
          event.urls = event.urls.concat(urlsUpdate);
        }
        this.update({ _id: event.id }, event, (err, document) => {
          if (err) {
            callBack(err);
          } else {
            callBack(null, document);
          }
        });
      }
    })
    .catch((reason) => {
      callBack(reason);
    });
};

EventSchema.statics.removeImages = function (event, publicId, callBack) {
  this.update(
    { _id: event },
    {
      $pull: {
        urls: {
          publicId,
        },
      },
    },
    (err, document) => {
      if (err) {
        callBack(err);
      } else {
        callBack(null, document);
      }
    },
  );
};

EventSchema.statics.getOneHourLeftEvents = function (callBack) {
  const dateTimeOneHourFromNow = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  this.find({
    $and: [
      {
        $or: [
          {
            reminded: false,
          },
          {
            remindedHost: false,
          },
        ],
      },
      {
        $and: [
          // Start time must be less than one hour later of current time
          {
            startTime: { $lte: dateTimeOneHourFromNow },
          },
        ],
      },
    ],
  })
    .then((value) => {
      callBack(null, value);
    })
    .catch((err) => {
      callBack(err);
    });
};

EventSchema.statics.findMyAttendingEvent = function (email, queryParams, callBack) {
  const criteria = [
    {
      $project: {
        id: {
          $toString: '$_id',
        },
        name: '$name',
        location: '$location',
        startTime: '$startTime',
        endTime: '$endTime',
        urls: '$urls',
      },
    },
    {
      $lookup: {
        from: 'guests',
        localField: 'id',
        foreignField: 'event',
        as: 'guestInfo',
      },
    },
    { $unwind: '$guestInfo' },
    {
      $project: {
        _id: 0,
        id: 1,
        name: 1,
        location: 1,
        startTime: 1,
        endTime: 1,
        urls: 1,
        guestInfo: {
          id: {
            $toString: '$guestInfo._id',
          },
          email: 1,
          invited: 1,
          priority: 1,
          table: 1,
          group: 1,
        },
      },
    },
  ];
  if (queryParams) {
    const { start, end, sort, order, q } = queryParams;
    criteria.push(
      {
        $match: {
          $and: [
            {
              'guestInfo.invited': true,
            },
            {
              $and: [
                { 'guestInfo.email': email },
                {
                  $or: [
                    {
                      name: {
                        $regex: q,
                        $options: 'i',
                      },
                    },
                    {
                      location: {
                        $regex: q,
                        $options: 'i',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
      {
        $sort: { [sort]: order === 'ASC' ? 1 : -1 },
      },
      { $skip: +start },
      { $limit: +end - +start },
    );
  } else {
    criteria.push(
      {
        $match: {
          $and: [{ 'guestInfo.email': email }, { 'guestInfo.invited': true }],
        },
      },
      {
        $sort: { startTime: -1 },
      },
    );
  }
  return this.aggregate(criteria)
    .then((value) => {
      callBack(null, value);
    })
    .catch((reason) => {
      callBack(reason);
    });
};

EventSchema.statics.countMyAttendingEvent = function (email, queryParams, callBack) {
  const { q } = queryParams;
  const criteria = [
    {
      $project: {
        id: {
          $toString: '$_id',
        },
        name: '$name',
        location: '$location',
        startTime: '$startTime',
        endTime: '$endTime',
      },
    },
    {
      $lookup: {
        from: 'guests',
        localField: 'id',
        foreignField: 'event',
        as: 'guestInfo',
      },
    },
    { $unwind: '$guestInfo' },
    {
      $match: {
        $and: [
          {
            'guestInfo.invited': true,
          },
          {
            $and: [
              { 'guestInfo.email': email },
              {
                $or: [
                  {
                    name: {
                      $regex: q,
                      $options: 'i',
                    },
                  },
                  {
                    location: {
                      $regex: q,
                      $options: 'i',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      $count: 'attending_event',
    },
  ];
  return this.aggregate(criteria)
    .then((value) => {
      callBack(null, value);
    })
    .catch((reason) => {
      callBack(reason);
    });
};

EventSchema.set('toObject', { getters: true });
EventSchema.set('toJSON', { getters: true });

module.exports = mongoose.model('Event', EventSchema);
