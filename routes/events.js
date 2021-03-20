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
       value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.eyJpc3MiOiJIdW5nS2hhQW5LaWV0VHVhbiIsInN1YiI6IjYw
MGVhNDg4ZjcwZGE5M2ZkZTJiM2FjYyIsImlhdCI6MTYxNjIxMTA4MCwiZXhwIjoyODI1ODExMDgwfQ
.jXQDy9JOVP7yPaoHRAC2fn6wDkXZzZJrLzISPlyu1iI'
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
     value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.eyJpc3MiOiJIdW5nS2hhQW5LaWV0VHVhbiIsInN1YiI6IjYw
MGVhNDg4ZjcwZGE5M2ZkZTJiM2FjYyIsImlhdCI6MTYxNjIxMTA4MCwiZXhwIjoyODI1ODExMDgwfQ
.jXQDy9JOVP7yPaoHRAC2fn6wDkXZzZJrLzISPlyu1iI'
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
       value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.eyJpc3MiOiJIdW5nS2hhQW5LaWV0VHVhbiIsInN1YiI6IjYw
MGVhNDg4ZjcwZGE5M2ZkZTJiM2FjYyIsImlhdCI6MTYxNjIxMTA4MCwiZXhwIjoyODI1ODExMDgwfQ
.jXQDy9JOVP7yPaoHRAC2fn6wDkXZzZJrLzISPlyu1iI'
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
     value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.eyJpc3MiOiJIdW5nS2hhQW5LaWV0VHVhbiIsInN1YiI6IjYw
MGVhNDg4ZjcwZGE5M2ZkZTJiM2FjYyIsImlhdCI6MTYxNjIxMTA4MCwiZXhwIjoyODI1ODExMDgwfQ
.jXQDy9JOVP7yPaoHRAC2fn6wDkXZzZJrLzISPlyu1iI'
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

router.post(
  '/invite-qr',
  /*
  #swagger.parameters['loginUser'] = {
     in: 'header',
     description: 'Token From Login.',
     required: true,
     name: 'access_token',
     value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.eyJpc3MiOiJIdW5nS2hhQW5LaWV0VHVhbiIsInN1YiI6IjYw
MGVhNDg4ZjcwZGE5M2ZkZTJiM2FjYyIsImlhdCI6MTYxNjIxMTA4MCwiZXhwIjoyODI1ODExMDgwfQ
.jXQDy9JOVP7yPaoHRAC2fn6wDkXZzZJrLzISPlyu1iI'
  },
  #swagger.parameters['tableEvents'] = {
     in: 'body',
     description: 'Event For Updating Table.',
     required: true,
     name: 'updateTableEvent',
     schema: {
      $eventId: "6048506f8fb7b6249151343e",
      $tables: []
    }
  }
*/
  eventCtrl.addOrUpdateTable,
);

module.exports = router;
