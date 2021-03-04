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
  event: {
    type: String,
    required: true,
  },
  table: {
    type: String,
  },
});

module.exports = mongoose.model('Guest', GuestSchema);
