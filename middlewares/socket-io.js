const socketIO = require('socket.io');
const mEvent = require('../models/mEvents');

module.exports = {
  startSocketServer(server) {
    const io = socketIO(server, {
      cors: true,
      origin: '*:*',
    });

    io.on('connection', (request) => {
      console.log(request);
    });

    io.on('get-event-status', (request) => {
      console.log(request);
    });
  },
};
