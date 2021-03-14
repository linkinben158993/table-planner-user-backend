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

router.post(
  '/edit',
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
    #swagger.parameters['Guest'] = {
        in: 'body',
        description: 'Token From Login.',
        required: true,
        name: 'newGuest',
        schema: {
        $guestId: "604c85f990942b4b4416c639",
        $guestName: "edit guest",
        $guestMail: "edit guest mail",
        $guestPhone: "0123456",
        }
    }
    */
  guestCtrl.editGuest,
);

router.post(
  '/delete',
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
    #swagger.parameters['Guest'] = {
        in: 'body',
        description: 'GuestId',
        required: true,
        name: 'guestId',
        schema: {
        $id: "604c85f990942b4b4416c639",
        }
    }
  */
  guestCtrl.deleteGuest,
);

module.exports = router;
