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
    const res = new Promise((resolve) => {
      cloudinary.uploader.upload(
        file,
        (result) => {
          resolve({
            url: result.url,
            id: result.public_id,
          });
        },
        {
          resource_type: 'auto',
          folder,
        },
      );
    });
    return res;
  },
};
