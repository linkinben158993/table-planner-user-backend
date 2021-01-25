const express = require('express');
const userCtrl = require('../controllers/users.controller');

const router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

router.post('/login', userCtrl.login);

router.post('/register', userCtrl.register);

router.get('/authenticated', userCtrl.authenticated);

module.exports = router;
