const express = require('express');
const fs = require('fs');
const cloudinary = require('../uploads/cloudinary');
const Events = require('../models/mEvents');
const CustomResponse = require('../constants/response.message');
const upload = require('../uploads/multer');

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

      // eslint-disable-next-line no-console
      console.log(files);
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

router.post('/profile', async (req, res) => {
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
        const url = newPath;
        res.status(200).json({
          message: {
            msgBody: 'Image Uploaded Successfully!',
            msgError: false,
          },
          data: url,
        });
      }
    }
  });
});

module.exports = router;
