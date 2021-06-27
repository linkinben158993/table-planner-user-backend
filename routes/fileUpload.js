const express = require('express');
const fs = require('fs');
const cloudinary = require('../uploads/cloudinary');
const Users = require('../models/mUsers');
const Events = require('../models/mEvents');
const CustomResponse = require('../constants/response.message');
const upload = require('../uploads/multer');

const passport = require('passport');
// eslint-disable-next-line no-unused-vars
const passportConfig = require('../middlewares/passport');

const uploadMultiple = upload.array('image', 5);
const uploadOne = upload.array('profile', 1);

const router = express.Router();

router.post('/event-remove', async (req, res) => {
  uploadMultiple(req, res, async (err) => {
    if (err) {
      res.status(500).json({
        message: {
          msgBody: err.message,
          msgError: true,
        },
      });
    } else {
      const { id, publicId } = req.body;
      if (!publicId || !id) {
        res.status(400).json(CustomResponse.BAD_REQUEST);
      } else {
        Events.removeImages(id, publicId, async (err, response) => {
          if (err) {
            res.status(500).json({
              message: {
                msgBody: err.message,
                msgError: true,
              },
              trace: response,
            });
          } else {
            cloudinary
              .removeImages(publicId)
              .then((response1) => {
                res.status(200).json({
                  message: {
                    msgBody: 'Remove image successfully!',
                    msgError: false,
                  },
                  trace: response1,
                });
              })
              .catch((err) => {
                res.status(500).json({
                  message: {
                    msgBody: 'Remove image unsuccessful!',
                    msgError: false,
                  },
                  trace: err,
                });
              });
          }
        });
      }
    }
  });
});

router.post('/events', async (req, res) => {
  uploadMultiple(req, res, async (err) => {
    if (err) {
      res.status(500).json({
        message: {
          msgBody: err.message,
          msgError: true,
        },
      });
    } else {
      const urls = [];
      const { files } = req;

      if (files.length > 5 || files.length < 1) {
        res.status(400).json({
          message: {
            msgBody: 'Should Not Above 5 Files Or Less Than 1 Files',
            msgError: true,
          },
        });
      } else {
        for (let index = 0; index < files.length; index += 1) {
          const { path } = files[index];
          // eslint-disable-next-line no-await-in-loop
          const newPath = await cloudinary.uploadsImages(path, 'Images');
          fs.unlinkSync(path);
          urls.push(newPath);
        }

        res.status(200).json({
          message: {
            msgBody: 'Images Uploaded Successfully!',
            msgError: false,
          },
          data: urls,
        });
      }
    }
  });
});

router.post(
  '/profile-avt',
  /*
   #swagger.parameters['loginUser'] = {
      in: 'header',
      description: 'Token From Login.',
      required: true,
      name: 'access_token',
      value : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIdW5nS2hhQW5LaWV0VHVhbiIsInN1YiI6IjYwNjlkOWM4YjVjYzZlMDAyMGZiMGJjZSIsImlhdCI6MTYxODE1MzMzNCwiZXhwIjoyODI3NzUzMzM0fQ.5_nY8cUEwKq1zg5vW3g7yIrZ97_rxd-KbgVvI_L3jFQ'
  },
  #swagger.parameters['avtUrl'] = {
      in: 'formData',
      description: 'Avt Url To Update.',
      required: true,
  }
} */
  async (req, res, next) => {
    passport.authenticate('jwt', { session: false }, async (err, callBack) => {
      if (err) {
        const response = CustomResponse.SERVER_ERROR;
        response.trace = err;
        res.status(500).json(response);
      }
      if (!callBack) {
        res.status(403).json(CustomResponse.FORBIDDEN);
      } else {
        req.user = callBack;
        next();
      }
    })(req, res, next);
  },
  async (req, res) => {
    uploadOne(req, res, async (err) => {
      if (err) {
        res.status(500).json({
          message: {
            msgBody: err.message,
            msgError: true,
          },
        });
      } else {
        const { files } = req;

        if (files.length != 1) {
          res.status(400).json({
            message: {
              msgBody: 'Profile picture should only be one file',
              msgError: true,
            },
          });
        } else {
          const { path } = files[0];
          const newPath = await cloudinary.uploadsImages(path, 'Profiles');
          fs.unlinkSync(path);
          const { url } = newPath;
          Users.updateAvatar(req.user._id, url, (err1, document) => {
            if (err1) {
              const response = CustomResponse.SERVER_ERROR;
              response.trace = err1;
              res.status(500).json(response);
            } else {
              res.status(200).json({
                message: {
                  msgBody: 'Successfully update user avatar info!',
                  msgError: false,
                },
                trace: {
                  document,
                },
              });
            }
          });
        }
      }
    });
  }
);

module.exports = router;
