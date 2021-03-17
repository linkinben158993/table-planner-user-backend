const multer = require('multer');

const storage = multer.diskStorage({
  destination(req, file, callBack) {
    callBack(null, './uploads/');
  },

  filename(req, file, callBack) {
    callBack(null, `${new Date().toISOString()}-${file.originalname}`);
  },
});

// Validate file
const fileValidator = (req, file, callBack) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    callBack(null, true);
  } else {
    callBack({
      message: {
        msgBody: 'Unsupported File Type!',
        msgError: true,
      },
    });
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 },
  fileFilter: fileValidator,
});

module.exports = upload;
