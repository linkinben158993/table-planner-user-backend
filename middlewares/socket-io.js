const socketIO = require('socket.io');

module.exports = {
  startSocketServer(server) {
    const io = socketIO(server, {
      cors: true,
      origin: '*:*',
    });

    io.on('connection', (response) => {
      console.log('Connection established:', response);
    });
  },
};
