const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    min: 6,
    max: 50,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 100,
  },
  fullName: {
    type: String,
    required: true,
    // Should not be empty
    default: "User's Name",
  },
  avatar: {
    type: String,
    require: false,
    default: 'https://toppng.com/uploads/preview/hackerman-11556286446gid8lfj2ce.png',
  },
  role: {
    type: Number,
    // -1: guest, 0: user, 1: admin
    enum: [-1, 0, 1],
  },
  otp: {
    type: Number,
  },
  activated: {
    type: Boolean,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  myEvents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Events',
    },
  ],
});

UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  bcrypt.hash(this.password, 10, (err, passwordHashed) => {
    if (err) {
      return next(err);
    }
    this.password = passwordHashed;
    return next();
  });

  return null;
});

UserSchema.methods.checkPassword = function (password, callBack) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    if (err) {
      return callBack(err);
    }

    if (!isMatch) {
      return callBack(null, {
        message: {
          msgBody: 'Password not match!',
          msgError: true,
        },
        errCode: 'ERR_PASSWORD_NOT_MATCH',
      });
    }

    return callBack(null, this);
  });
};

UserSchema.methods.changePassword = function (user, oldPassword, newPassword, callBack) {
  if (oldPassword === newPassword) {
    return callBack(null, {
      message: {
        msgBody: 'New Password Should Be Different From Old Password!',
        msgError: true,
      },
    });
  }
  return user.checkPassword(oldPassword, (err, isMatch) => {
    if (err) {
      return callBack(err);
    }
    if (isMatch.message) {
      return callBack(null, {
        message: {
          msgBody: 'Old Password Does Not Match!',
          msgError: true,
        },
      });
    }

    return callBack(null, newPassword, isMatch);
  });
};

UserSchema.statics.createUserWithOTP = function (email, password, otp, callBack) {
  this.findOne({ email }, (err, user) => {
    if (err) {
      return callBack(err);
    }
    if (user) {
      return callBack(null, {
        message: {
          msgBody: 'User Exists',
          msgError: true,
        },
        user: {
          username: user.email,
          fullName: user.fullName,
        },
      });
    }

    const newUser = new this({
      email,
      password,
      role: 0,
      otp,
      activated: false,
    });

    return newUser
      .save()
      .then(() => callBack(null, true))
      .catch((err1) => callBack(null, err1));
  });
};

UserSchema.statics.findUserByUserOrFullName = function (queryString, callBack) {
  return this.find({
    $or: [
      {
        email: {
          $regex: queryString,
          $options: 'i',
        },
      },
      {
        fullName: {
          $regex: queryString,
          $options: 'i',
        },
      },
    ],
  })
    .then((value) => {
      if (value.length === 0) {
        return callBack(null, 0);
      }

      return callBack(null, value);
    })
    .catch((err) => callBack(err));
};

UserSchema.statics.setBlockStatus = function (userId, callBack) {
  return this.findOne({
    _id: userId,
  })
    .then((value) => {
      value.set({ blocked: !value.blocked });
      value
        .save()
        .then((value1) => callBack(null, value1))
        .catch((err) => callBack(err));
    })
    .catch((err) => callBack(err));
};

module.exports = mongoose.model('User', UserSchema);
