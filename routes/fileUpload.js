const express = require('express');
const fs = require('fs');
const cloudinary = require('../uploads/cloudinary');
const upload = require('../uploads/multer');

const router = express.Router();

router.post('/events', upload.array('image', 5), async (req, res) => {
  try {
    const uploader = async (path) => {
      const result = await cloudinary.uploadsImages(path, 'Images');
      // eslint-disable-next-line no-console
      console.log(result);
    };
    const urls = [];
    const { files } = req;

    // eslint-disable-next-line no-restricted-syntax
    for (const file of files) {
      const { path } = file;
      // eslint-disable-next-line no-await-in-loop
      const newPath = await uploader(path);
      urls.push(newPath);
      fs.unlinkSync(path);
    }

    res.status(200).json({
      message: { msgBody: 'Images Uploaded Successfully!', msgError: false },
      data: urls,
    });
  } catch (e) {
    res.status(200).json({
      message: { msgBody: 'Images Uploaded Failed!', msgError: true },
      trace: e,
    });
  }
});

module.exports = router;
