const express = require('express');
const eventCtrl = require('../controllers/events.controller');

const router = express.Router();

router.get('/my', eventCtrl.getAllEvents);

router.post('/add', eventCtrl.addNewEvent);

router.post('/edit', eventCtrl.editEvent);

module.exports = router;
