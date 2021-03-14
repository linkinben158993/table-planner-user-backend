const express = require('express');
const eventCtrl = require('../controllers/events.controller');

const router = express.Router();

router.get(
  '/my',
  /* #swagger.parameters['loginUser'] = {
       in: 'header',
       description: 'Token From Login.',
       required: true,
       name: 'access_token',
       schema: {
        $access_token: "<Get This From Login API>"
       }
  }
 */
  eventCtrl.getAllEvents,
);

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
  #swagger.parameters['newEvent'] = {
     in: 'body',
     description: 'Token From Login.',
     required: true,
     name: 'newEvent',
     schema: {
      $eventName: "Test Event With JWT Protection And De-reference stuff From Swagger",
      $eventDescription: "Test Event With JWT Protection And De-reference stuff From Swagger",
      $tableType: "Test Event Table Type"
    }
  }
*/
  eventCtrl.addNewEvent,
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
    #swagger.parameters['editEvent'] = {
       in: 'body',
       description: 'Event Id For Editing.',
       required: true,
       name: 'newEvent',
       schema: {
        $eventId: "6048506f8fb7b6249151343e",
        $eventName: "Test Edit Event With JWT Protection And De-reference stuff From Swagger",
        $eventDescription: "Test Edit Event Table Type"
      }
    }
*/
  eventCtrl.editEvent,
);

router.post(
  '/invite-qr',
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
  #swagger.parameters['sendMailEvent'] = {
     in: 'body',
     description: 'Event For Sending Invitation.',
     required: true,
     name: 'sendMailEvent',
     schema: {
      $eventId: "6048506f8fb7b6249151343e",
    }
  }
*/
  eventCtrl.sendMailToAllGuest,
);

module.exports = router;
