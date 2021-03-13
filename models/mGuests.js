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
  priority: {
    type: Number,
  },
  event: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Guest', GuestSchema);
