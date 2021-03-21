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
      let result;
      const uploader = async (path) => {
        result = await cloudinary.uploadsImages(path, 'Images');
        return result;
      };
      const urls = [];
      const { files } = req;

      if (files.lenght > 5 || files.lenght < 2) {
        res.status(200).json({
          message: {
            msgBody: 'Should Not Above 5 Files Or Less Than 3 Files',
            msgError: true,
          },
        });
      } else {
        files.map(async (file) => {
          const { path } = file;
          const newPath = await uploader(path);
          urls.push(newPath);
          fs.unlinkSync(path);
        });

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
