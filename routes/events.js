const express = require('express');
const eventCtrl = require('../controllers/events.controller');
const passport = require('../middlewares/passport');
const timeout = require('connect-timeout');

const router = express.Router();

router.get(
  '/information/:id',
  /* #swagger.parameters['loginUser'] = {
     in: 'header',
     description: 'Token From Login.',
     required: true,
     name: 'access_token',
     value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIdW5nS2hhQW5LaWV0VHVhbiIsInN1YiI6IjYwMGVhNDg4ZjcwZGE5M2ZkZTJiM2FjYyIsImlhdCI6MTYxNjIxMTA4MCwiZXhwIjoyODI1ODExMDgwfQ.jXQDy9JOVP7yPaoHRAC2fn6wDkXZzZJrLzISPlyu1iI'
  }
  */
  passport.jwtStrategy,
  eventCtrl.getEventByID_Guest
);
router.get(
  '/my/:id',
  /* #swagger.parameters['loginUser'] = {
     in: 'header',
     description: 'Token From Login.',
     required: true,
     name: 'access_token',
     value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIdW5nS2hhQW5LaWV0VHVhbiIsInN1YiI6IjYwMGVhNDg4ZjcwZGE5M2ZkZTJiM2FjYyIsImlhdCI6MTYxNjIxMTA4MCwiZXhwIjoyODI1ODExMDgwfQ.jXQDy9JOVP7yPaoHRAC2fn6wDkXZzZJrLzISPlyu1iI'
  }
  */
  passport.jwtStrategy,
  eventCtrl.getEventByID_Host
);

router.get(
  '/my',
  /* #swagger.parameters['loginUser'] = {
       in: 'header',
       description: 'Token From Login.',
       required: true,
       name: 'access_token',
       value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIdW5nS2hhQW5LaWV0VHVhbiIsInN1YiI6IjYwNjlkOWM4YjVjYzZlMDAyMGZiMGJjZSIsImlhdCI6MTYxODE1MzMzNCwiZXhwIjoyODI3NzUzMzM0fQ.5_nY8cUEwKq1zg5vW3g7yIrZ97_rxd-KbgVvI_L3jFQ'
  }
 */
  passport.jwtStrategy,
  eventCtrl.getAllEvents
);

router.get(
  '/my-attending',
  /* #swagger.parameters['loginUser'] = {
       in: 'header',
       description: 'Token From Login.',
       required: true,
       name: 'access_token',
       value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIdW5nS2hhQW5LaWV0VHVhbiIsInN1YiI6IjYwMGVhNDg4ZjcwZGE5M2ZkZTJiM2FjYyIsImlhdCI6MTYxNjIxMTA4MCwiZXhwIjoyODI1ODExMDgwfQ.jXQDy9JOVP7yPaoHRAC2fn6wDkXZzZJrLzISPlyu1iI'
  }
 */
  passport.jwtStrategy,
  eventCtrl.getMyAttendingEvents
);

router.post(
  '/add',
  /*
  #swagger.parameters['loginUser'] = {
     in: 'header',
     description: 'Token From Login.',
     required: true,
     name: 'access_token',
     value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIdW5nS2hhQW5LaWV0VHVhbiIsInN1YiI6IjYwNjlkOWM4YjVjYzZlMDAyMGZiMGJjZSIsImlhdCI6MTYxODE1MzMzNCwiZXhwIjoyODI3NzUzMzM0fQ.5_nY8cUEwKq1zg5vW3g7yIrZ97_rxd-KbgVvI_L3jFQ'
  },
  #swagger.parameters['newEvent'] = {
     in: 'body',
     description: 'Token From Login.',
     required: true,
     name: 'newEvent',
     schema: {
      $name: 'Test Event With JWT Protection And De-reference stuff From Swagger',
      $description: 'Test Event With JWT Protection And De-reference stuff From Swagger'
    }
  }
*/
  passport.jwtStrategy,
  eventCtrl.addNewEvent
);

router.post(
  '/edit',
  /*
    #swagger.parameters['loginUser'] = {
       in: 'header',
       description: 'Token From Login.',
       required: true,
       name: 'access_token',
       value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIdW5nS2hhQW5LaWV0VHVhbiIsInN1YiI6IjYwNjlkOWM4YjVjYzZlMDAyMGZiMGJjZSIsImlhdCI6MTYxODE1MzMzNCwiZXhwIjoyODI3NzUzMzM0fQ.5_nY8cUEwKq1zg5vW3g7yIrZ97_rxd-KbgVvI_L3jFQ'
    },
    #swagger.parameters['editEvent'] = {
       in: 'body',
       description: 'Event Id For Editing.',
       required: true,
       name: 'newEvent',
       schema: {
        $id: '6048506f8fb7b6249151343e',
        $name: 'Test Edit Event With JWT Protection And De-reference stuff From Swagger',
        $description: 'Test Edit Event Table Type',
        $elements: 'Stringify object from React Flow <Not Required But Should Pass Empty String On Submit or Old State>'
      }
    }
*/
  passport.jwtStrategy,
  eventCtrl.editEvent
);

router.post(
  '/delete',
  /*
    #swagger.parameters['loginUser'] = {
       in: 'header',
       description: 'Token From Login.',
       required: true,
       name: 'access_token',
       value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIdW5nS2hhQW5LaWV0VHVhbiIsInN1YiI6IjYwNjlkOWM4YjVjYzZlMDAyMGZiMGJjZSIsImlhdCI6MTYxODE1MzMzNCwiZXhwIjoyODI3NzUzMzM0fQ.5_nY8cUEwKq1zg5vW3g7yIrZ97_rxd-KbgVvI_L3jFQ'
    },
    #swagger.parameters['removeEvent'] = {
       in: 'body',
       description: 'Event Id For Removing.',
       required: true,
       name: 'removeEvent',
       schema: {
        $id: '6048506f8fb7b6249151343e',
      }
    }
*/
  passport.jwtStrategy,
  eventCtrl.deleteEvent
);

router.post(
  '/invite-qr',
  /*
  #swagger.parameters['loginUser'] = {
     in: 'header',
     description: 'Token From Login.',
     required: true,
     name: 'access_token',
     value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIdW5nS2hhQW5LaWV0VHVhbiIsInN1YiI6IjYwNjlkOWM4YjVjYzZlMDAyMGZiMGJjZSIsImlhdCI6MTYxODE1MzMzNCwiZXhwIjoyODI3NzUzMzM0fQ.5_nY8cUEwKq1zg5vW3g7yIrZ97_rxd-KbgVvI_L3jFQ'
  },
  #swagger.parameters['sendMailEvent'] = {
     in: 'body',
     description: 'Event For Sending Invitation.',
     required: true,
     name: 'sendMailEvent',
     schema: {
      $id: '6056e995ef1b7d0020e139f4',
    }
  }
*/
  timeout('30s'),
  passport.jwtStrategy,
  eventCtrl.sendMailToAllGuest
);

module.exports = router;
