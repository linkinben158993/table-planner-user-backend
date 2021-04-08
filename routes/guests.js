const express = require('express');
const guestCtrl = require('../controllers/guests.controller');

const router = express.Router();

// router.post(
//   '/add',
//   /*
//     #swagger.parameters['loginUser'] = {
//         in: 'header',
//         description: 'Token From Login.',
//         required: true,
//         name: 'access_token',
//         value : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIdW5nS2hhQW5LaWV0VHVhbiIsInN1YiI6IjYwNjlkOWM4YjVjYzZlMDAyMGZiMGJjZSIsImlhdCI6MTYxNzgwNzEyNSwiZXhwIjoyODI3NDA3MTI1fQ.czOLRtuQe4hNKMV2pBVcf9ZeiL3h0zLpgzONz7J7QFw'
//     },
//     #swagger.parameters['newGuest'] = {
//         in: 'body',
//         description: 'Token From Login.',
//         required: true,
//         name: 'newGuest',
//         schema: {
//         $guestName: "Test Guest With JWT Protection And De-reference stuff From Swagger",
//         $guestMail: "Test Guest With JWT Protection And De-reference stuff From Swagger",
//         $guestPhone: "Test Event Table Type",
//         $eventId: "6048529d3a797826f6920062",
//         }
//     }
//     */
//   guestCtrl.addNewGuest,
// );

router.post(
  '/add',
  /*
    #swagger.parameters['loginUser'] = {
        in: 'header',
        description: 'Token From Login.',
        required: true,
        name: 'access_token',
        value : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIdW5nS2hhQW5LaWV0VHVhbiIsInN1YiI6IjYwNjlkOWM4YjVjYzZlMDAyMGZiMGJjZSIsImlhdCI6MTYxNzgwNzEyNSwiZXhwIjoyODI3NDA3MTI1fQ.czOLRtuQe4hNKMV2pBVcf9ZeiL3h0zLpgzONz7J7QFw'
    },
    #swagger.parameters['newGuest'] = {
        in: 'body',
        description: 'New Guests Array For Import.',
        required: true,
        name: 'newGuest',
        schema: [
          {
            "name": "Test 1",
            "email": "Test Guest With JWT Protection And De-reference stuff From Swagger",
            "phoneNumber": "Test Event Table Type",
            "eventId": "6048529d3a797826f6920062",
            "table": {
              "id": "1",
              "seatNo": 1,
            }
          }
        ]
    }
    */
  guestCtrl.importGuests
);

router.get(
  '/get/:id',
  /*
    #swagger.parameters['loginUser'] = {
      in: 'header',
      description: 'Token From Login.',
      required: true,
      name: 'access_token',
      value : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIdW5nS2hhQW5LaWV0VHVhbiIsInN1YiI6IjYwNjlkOWM4YjVjYzZlMDAyMGZiMGJjZSIsImlhdCI6MTYxNzgwNzEyNSwiZXhwIjoyODI3NDA3MTI1fQ.czOLRtuQe4hNKMV2pBVcf9ZeiL3h0zLpgzONz7J7QFw'    }

  */
  guestCtrl.getGuestList
);

router.post(
  '/edit',
  /*
    #swagger.parameters['loginUser'] = {
        in: 'header',
        description: 'Token From Login.',
        required: true,
        name: 'access_token',
        value : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIdW5nS2hhQW5LaWV0VHVhbiIsInN1YiI6IjYwNjlkOWM4YjVjYzZlMDAyMGZiMGJjZSIsImlhdCI6MTYxNzgwNzEyNSwiZXhwIjoyODI3NDA3MTI1fQ.czOLRtuQe4hNKMV2pBVcf9ZeiL3h0zLpgzONz7J7QFw'
    },
    #swagger.parameters['Guest'] = {
        in: 'body',
        description: 'Token From Login.',
        required: true,
        name: 'newGuest',
        schema: {
        $id: "604c85f990942b4b4416c639",
        $name: "edit guest",
        $email: "edit guest mail",
        $phoneNumber: "0123456",
        }
    }
    */
  guestCtrl.editGuest
);

router.post(
  '/delete',
  /*
    #swagger.parameters['loginUser'] = {
        in: 'header',
        description: 'Token From Login.',
        required: true,
        name: 'access_token',
        value : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIdW5nS2hhQW5LaWV0VHVhbiIsInN1YiI6IjYwNjlkOWM4YjVjYzZlMDAyMGZiMGJjZSIsImlhdCI6MTYxNzgwNzEyNSwiZXhwIjoyODI3NDA3MTI1fQ.czOLRtuQe4hNKMV2pBVcf9ZeiL3h0zLpgzONz7J7QFw'    },
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
  guestCtrl.deleteGuest
);

router.post(
  '/assign',
  /*
  #swagger.parameters['loginUser'] = {
      in: 'header',
      description: 'Token From Login.',
      required: true,
      name: 'access_token',
      value : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIdW5nS2hhQW5LaWV0VHVhbiIsInN1YiI6IjYwNjlkOWM4YjVjYzZlMDAyMGZiMGJjZSIsImlhdCI6MTYxNzgwNzEyNSwiZXhwIjoyODI3NDA3MTI1fQ.czOLRtuQe4hNKMV2pBVcf9ZeiL3h0zLpgzONz7J7QFw'  },
  #swagger.parameters['guestList'] = {
      in: 'body',
      description: 'Guest List With Guest Seats.',
      required: true,
      name: 'newGuest',
      schema: [
        {
          "id": "6048529d3a797826f6920062",
          "table": {
            "id": "1",
            "seatNo": 1,
          }
        }
      ]
  }
  */
  guestCtrl.assignTable
);

router.patch(
  '/setPriority',
  /*
    #swagger.parameters['loginUser'] = {
        in: 'header',
        description: 'Token From Login.',
        required: true,
        name: 'access_token',
        value : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIdW5nS2hhQW5LaWV0VHVhbiIsInN1YiI6IjYwNjlkOWM4YjVjYzZlMDAyMGZiMGJjZSIsImlhdCI6MTYxNzgwNzEyNSwiZXhwIjoyODI3NDA3MTI1fQ.czOLRtuQe4hNKMV2pBVcf9ZeiL3h0zLpgzONz7J7QFw'
    },
    #swagger.parameters['Guest'] = {
        in: 'body',
        description: 'Token From Login.',
        required: true,
        id: 'guestId',
        schema: {
        $id: "606bd0276d84130d634b2848",
        $priority: "0123456",
        }
    }
    */
  guestCtrl.setPriorityGuest
);

router.patch(
  '/checkin',
  /*
    #swagger.parameters['loginUser'] = {
        in: 'header',
        description: 'Token From Login.',
        required: true,
        name: 'access_token',
        value : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIdW5nS2hhQW5LaWV0VHVhbiIsInN1YiI6IjYwNjlkOWM4YjVjYzZlMDAyMGZiMGJjZSIsImlhdCI6MTYxNzgwNzEyNSwiZXhwIjoyODI3NDA3MTI1fQ.czOLRtuQe4hNKMV2pBVcf9ZeiL3h0zLpgzONz7J7QFw'
    },
    #swagger.parameters['Guest'] = {
        in: 'body',
        description: 'GuestID',
        required: true,
        id: 'guestId',
        schema: {
        $id: "606bd0276d84130d634b2848",
        }
    }
    */
  guestCtrl.checkin
);
module.exports = router;
