const socketIO = require('socket.io');
const CronJob = require('./node-cron');
const Guests = require('../models/mGuests');

module.exports = {
  startSocketServer: (server) => {
    const io = socketIO(server, {
      cors: true,
      origin: '*:*',
    });

    io.on('connection', (socket) => {
      console.info(`Client connected [id=${socket.id}]`);

      socket.on('join-room', ({ eventId }) => {
        console.info('Has joined room ' + eventId);
        // join room
        socket.join(eventId);

        socket.on('checkin', ({ guestId }) => {
          if (guestId) {
            Guests.checkin({ id: guestId, eventId }, (err, document) => {
              if (err) {
                socket.to(eventId).emit('checkin-error', err);
              } else {
                io.in(eventId).emit('update-map', document);
              }
            });
          }
        });
      });

      // socket disconnect
      socket.on('disconnect', () => {
        console.info(`[id=${socket.id}] disconnected`);
      });
    });
  },
};
