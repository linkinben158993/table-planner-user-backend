const express = require('express');
const guestCtrl = require('../controllers/guests.controller');

const router = express.Router();

router.post(
  '/add',
  /*
    #swagger.parameters['loginUser'] = {
        in: 'header',
        description: 'Token From Login.',
        required: true,
        name: 'access_token',
        schema: {
        $access_token: "<Get This From Login API>"
        }
    },
    #swagger.parameters['newGuest'] = {
        in: 'body',
        description: 'Token From Login.',
        required: true,
        name: 'newGuest',
        schema: {
        $guestName: "Test Guest With JWT Protection And De-reference stuff From Swagger",
        $guestMail: "Test Guest With JWT Protection And De-reference stuff From Swagger",
        $guestPhone: "Test Event Table Type",
        $eventId: "6048529d3a797826f6920062",
        }
    }
    */
  guestCtrl.addNewGuest,
);

router.get(
  '/get/:id',
  /*
    #swagger.parameters['loginUser'] = {
      in: 'header',
      description: 'Token From Login.',
      required: true,
      name: 'access_token',
      schema: {
        $access_token: "<Get This From Login API>"
      }
    }

  */
  guestCtrl.getGuestList,
);

module.exports = router;
