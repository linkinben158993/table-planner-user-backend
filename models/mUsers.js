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
  expoToken: {
    type: String,
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
  description: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  avatar: {
    type: String,
    require: false,
    default: 'https://iupac.org/wp-content/uploads/2018/05/default-avatar.png',
  },
  role: {
    type: Number,
    // -1: guest, 0: user, 1: admin
    enum: [-1, 0, 1],
  },
  otp: {
    type: Number,
  },
  otpReset: {
    otp: { type: Number },
    expires: {
      type: Date,
    },
  },
  activated: {
    type: Boolean,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
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
      callBack(err);
    } else if (!isMatch) {
      callBack({
        message: {
          msgBody: 'Password/Username not match!',
          msgError: true,
        },
        errCode: 'ERR_USERNAME_PASSWORD_NOT_MATCH',
      });
    } else {
      callBack(null, this);
    }
  });
};

UserSchema.methods.changePassword = function (user, oldPassword, newPassword, callBack) {
  if (oldPassword === newPassword) {
    callBack({
      message: {
        msgBody: 'New Password Should Be Different From Old Password!',
        msgError: true,
      },
    });
  }
  user.checkPassword(oldPassword, (err, isMatch) => {
    if (err) {
      callBack(err);
    }

    if (isMatch) {
      user
        .set({
          password: newPassword,
          otp: -1,
        })
        .save()
        .then((value) => {
          callBack(null, value);
        })
        .catch((err1) => {
          callBack(err1);
        });
    }
  });
};

UserSchema.statics.createUserWithOTP = function (userInfo, otp, callBack) {
  this.findOne({ email: userInfo.email }, (err, user) => {
    if (err) {
      return callBack(err);
    }
    if (user) {
      return callBack({
        message: {
          msgBody: 'User Exists',
          msgError: true,
        },
        user: {
          username: user.email,
          fullName: user.fullName,
        },
        errCode: 'ERR_USER_EXIST',
      });
    }

    const newUser = new this({
      email: userInfo.email,
      password: userInfo.password,
      fullName: userInfo.fullName,
      role: 0,
      otp,
      activated: false,
    });

    return newUser
      .save()
      .then(() => callBack(null, { username: newUser.email }))
      .catch((err1) => callBack(null, err1));
  });
};

UserSchema.statics.activateAccount = function (email, otp, callBack) {
  return this.findOne({
    email,
    activated: { $ne: true },
  })
    .then((value) => {
      if (!value) {
        callBack({
          message: {
            msgBody: 'No user found!',
            msgError: true,
          },
        });
      } else if (value.otp !== otp) {
        callBack({
          message: {
            msgBody: 'OTP Not Correct!',
            msgError: true,
          },
        });
      } else {
        value
          .set({
            otp: undefined,
            activated: true,
          })
          .save()
          .then(() => {
            callBack(null, value);
          })
          .catch((err) => {
            callBack(err);
          });
      }
    })
    .catch((err) => {
      callBack({
        message: {
          msgBody: 'Something happened!',
          msgError: true,
        },
        trace: err,
      });
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

UserSchema.statics.resetOTP = function (email, otpReset, callBack) {
  return this.findOne({ email })
    .then((value) => {
      value
        .set({ otpReset })
        .save()
        .then((value1) => {
          callBack(null, value1);
        })
        .catch((err) => callBack(err));
    })
    .catch((err) => callBack(err));
};

UserSchema.statics.resetUserPassword = function (email, otp, password, confirmPassword, callBack) {
  return this.findOne({
    email,
    activated: { $ne: false },
  })
    .then((value) => {
      const expires = new Date(value.otpReset.expires.toLocaleString()).getTime();
      const now = new Date().getTime();
      if (!value) {
        callBack({
          message: {
            msgBody: 'No user found!',
            msgError: true,
          },
          errCode: 'ERR_USER_NOT_FOUND',
        });
      } else if (now > expires || value.otpReset.otp !== otp) {
        callBack({
          message: {
            msgBody: 'OTP Not Correct Or Expires! Please Register New OTP',
            msgError: true,
          },
          errCode: 'ERR_OTP_EXPIRES',
        });
      } else {
        value.checkPassword(password, (err, isMatch) => {
          if (err && !err.errCode) {
            callBack({
              message: {
                msgBody: 'Reset password fail!',
                msgError: true,
              },
              trace: err,
            });
          } else if (isMatch) {
            callBack({
              message: {
                msgBody: 'New password should be different from old!',
                msgError: true,
              },
              errCode: 'ERR_RESET_TO_OLD',
            });
          } else {
            value.password = password;
            value.otpReset = undefined;
            value
              .save()
              .then(
                callBack(null, {
                  message: {
                    msgBody: 'Reset password successful!',
                    msgError: false,
                  },
                }),
              )
              .catch((reason) => {
                callBack({
                  message: {
                    msgBody: 'Reset password fail!',
                    msgError: true,
                  },
                  trace: reason,
                });
              });
          }
        });
      }
    })
    .catch((err) => {
      callBack(err);
    });
};

UserSchema.statics.updateExpoToken = function (id, expoToken, callBack) {
  return this.findOne({ _id: id })
    .then((value) => {
      if (!value) {
        callBack({
          message: {
            msgBody: 'No user found!',
            msgError: true,
          },
        });
      } else {
        value.set({ expoToken });
        value
          .save()
          .then((value1) => callBack(null, value1))
          .catch((reason) => callBack(reason));
      }
    })
    .catch((reason) => callBack(reason));
};

UserSchema.statics.findExpoTokenByEmail = function (emails, callBack) {
  return this.find({
    email: { $in: emails },
    expoToken: { $ne: null },
  })
    .then((value) => {
      if (value.length === 0) {
        return callBack(null, []);
      }
      return callBack(null, value);
    })
    .catch((reason) => callBack(reason));
};

UserSchema.statics.updateUserInfo = function (userId, userInfo, callBack) {
  this.update({ _id: userId }, userInfo)
    .then((response) => {
      callBack(null, response);
    })
    .catch((reason) => {
      callBack(reason);
    });
};

UserSchema.statics.updateAvatar = function (id, url, callBack) {
  this.updateOne({ _id: id }, { avatar: url }, (err, document) => {
    if (err) {
      callBack(err);
    } else {
      callBack(null, document);
    }
  });
};

UserSchema.set('toObject', { getters: true });
UserSchema.set('toJSON', { getters: true });

module.exports = mongoose.model('User', UserSchema);
