const socketIO = require('socket.io');
const mEvent = require('../models/mEvents');

module.exports = {
  startSocketServer(server) {
    const io = socketIO(server, {
      cors: true,
      origin: '*:*',
    });

    io.on('connection', (socket) => {
      socket.emit('greeting', {
        message: {
          msgBody: 'Hello from server',
          msgError: false,
        },
      });

      socket.on('get-event-status', (request) => {
        console.log(request);
        io.emit('reply-from-server', {
          message: {
            msgBody: 'Reply for previous',
              msgError: true,
          },
          data: request,
        })
      });
    });
  },
};
