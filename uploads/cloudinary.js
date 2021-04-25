const cloudinary = require('cloudinary');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.cloudName,
  api_key: process.env.cloudAPIKey,
  api_secret: process.env.cloudAPISecret,
});

module.exports = {
  uploadsImages: (file, folder) => {
    const res = new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        file,
        (result) => {
          if (result.asset_id) {
            resolve({
              url: result.url,
              id: result.public_id,
            });
          } else {
            reject(new Error('Something happened'));
          }
        },
        {
          resource_type: 'auto',
          folder,
        },
      );
    });
    return res;
  },
  removeImages: (publicId) => {
    const res = new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (result) => {
        if (result.result !== 'ok') {
          reject(result);
        } else {
          resolve({ success: true, result });
        }
      });
    });
    return res;
  },
};
