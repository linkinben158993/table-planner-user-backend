const express = require('express');
const fs = require('fs');
const cloudinary = require('../uploads/cloudinary');
const upload = require('../uploads/multer');

const uploadMultiple = upload.array('image', 5);

const router = express.Router();

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

      if (files.length > 5 || files.length < 2) {
        res.status(200).json({
          message: {
            msgBody: 'Should Not Above 5 Files Or Less Than 3 Files',
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

module.exports = router;
