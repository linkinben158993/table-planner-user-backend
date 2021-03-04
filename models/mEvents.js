const mongoose = require('mongoose');

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
  tables: {
    tableType: {
      type: String,
      required: true,
    },
    elements: [
      {
        id: {
          type: String,
          unique: true,
        },
        type: {
          type: String,
        },
        position: {
          x: {
            type: Number,
          },
          y: {
            type: Number,
          },
        },
        data: {
          label: {
            type: String,
            required: true,
          },
          guests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Guest' }],
        },
      },
    ],
  },
});

module.exports = mongoose.model('Event', EventSchema);
