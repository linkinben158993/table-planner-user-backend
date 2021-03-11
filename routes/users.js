const express = require('express');
const userCtrl = require('../controllers/users.controller');

const router = express.Router();

/* GET users listing. */
router.get('/', (req, res) => {
  res.send('respond with a resource');
});

router.post(
  '/login',
  /* #swagger.parameters['loginUser'] = {
       in: 'body',
       description: 'Info for logging in.',
       required: true,
       schema: {
        $username: "an@gmail.com",
        $password: "123456"
       }
} */
  userCtrl.login,
);

router.post(
  '/register',
  /* #swagger.parameters['newUser'] = {
     in: 'body',
     description: 'Info for registering new account.',
     required: true,
     schema: {
      $username: "an@gmail.com",
      $password: "123456"
     }
} */
  userCtrl.register,
);

router.post(
  '/forget-password',
  /* #swagger.parameters['resetUser'] = {
   in: 'body',
   description: 'Info for resetting account password.',
   required: true,
   schema: {
    $email: "an@gmail.com",
   }
} */
  userCtrl.forgetPassword,
);

router.post(
  '/reset-password',
  /* #swagger.parameters['resetUser'] = {
   in: 'body',
   description: 'Info for resetting account password.',
   required: true,
   schema: {
    $email: "an@gmail.com",
    $oldPassword: "an@gmail.com",
    $newPassword: "an@gmail.com",
   }
} */
  userCtrl.resetPassword,
);

router.get('/authenticated', userCtrl.authenticated);

module.exports = router;
